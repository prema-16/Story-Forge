import {
  ITextProvider,
  TextGenerationOptions,
  TextGenerationResult,
  TextStreamChunk,
} from '../interfaces/ITextProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'deepseek-chat': { input: 0.00014, output: 0.00028 },     // DeepSeek-V3
  'deepseek-reasoner': { input: 0.00055, output: 0.00219 }, // DeepSeek-R1
};

export class DeepSeekProvider implements ITextProvider {
  readonly providerName = 'deepseek';
  readonly defaultModel = 'deepseek-chat';
  readonly supportedModels = ['deepseek-chat', 'deepseek-reasoner'];

  private readonly baseUrl = 'https://api.deepseek.com/v1';

  isAvailable(): boolean {
    return !!env.DEEPSEEK_API_KEY;
  }

  async generate(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model || this.defaultModel;

    if (!env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is not set');

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[DeepSeek] API request failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const tokensUsed = data.usage?.total_tokens || (promptTokens + completionTokens);
    const cost = this.estimateCost(promptTokens, completionTokens, model);

    logger.debug(`[DeepSeek] ${model} — ${tokensUsed} tokens — ${Date.now() - start}ms`);

    return {
      content,
      tokensUsed,
      model,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost,
    };
  }

  async generateStream(
    prompt: string,
    onChunk: (chunk: TextStreamChunk) => void,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model || this.defaultModel;

    if (!env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY is not set');

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`[DeepSeek Stream] Request failed (${response.status}): ${errText}`);
    }

    let fullText = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              onChunk({ text: delta, isComplete: false });
            }
          } catch {
            // Ignore partial parse boundaries
          }
        }
      }
    }

    onChunk({ text: '', isComplete: true });

    const promptTokens = Math.floor(prompt.length / 4);
    const completionTokens = Math.floor(fullText.length / 4);
    const tokensUsed = promptTokens + completionTokens;

    return {
      content: fullText,
      tokensUsed,
      model,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(promptTokens, completionTokens, model),
    };
  }

  async generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<{ data: T; meta: Omit<TextGenerationResult, 'content'> }> {
    const result = await this.generate(prompt, {
      ...options,
      responseFormat: 'json',
    });

    const cleaned = result.content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const data = JSON.parse(cleaned) as T;
    const { content: _content, ...meta } = result;
    return { data, meta };
  }

  estimateCost(promptTokens: number, completionTokens: number, model?: string): number {
    const m = model || this.defaultModel;
    const rates = MODEL_COSTS[m] || MODEL_COSTS[this.defaultModel];
    return (promptTokens / 1000) * rates.input + (completionTokens / 1000) * rates.output;
  }
}
