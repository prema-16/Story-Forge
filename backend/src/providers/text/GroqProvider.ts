import {
  ITextProvider,
  TextGenerationOptions,
  TextGenerationResult,
  TextStreamChunk,
} from '../interfaces/ITextProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'llama-3.3-70b-versatile': { input: 0.00059, output: 0.00079 },
  'llama-3.1-8b-instant': { input: 0.00005, output: 0.00008 },
  'mixtral-8x7b-32768': { input: 0.00024, output: 0.00024 },
};

export class GroqProvider implements ITextProvider {
  readonly providerName = 'groq';
  readonly defaultModel = 'llama-3.3-70b-versatile';
  readonly supportedModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
  ];

  private readonly baseUrl = 'https://api.groq.com/openai/v1';

  isAvailable(): boolean {
    return !!env.GROQ_API_KEY;
  }

  async generate(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model || this.defaultModel;

    if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
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
      throw new Error(`[Groq] API request failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const tokensUsed = data.usage?.total_tokens || (promptTokens + completionTokens);
    const cost = this.estimateCost(promptTokens, completionTokens, model);

    logger.debug(`[Groq] ${model} — ${tokensUsed} tokens — ${Date.now() - start}ms`);

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

    if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
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
      throw new Error(`[Groq Stream] Request failed (${response.status}): ${errText}`);
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
            // Ignore parse errors on chunk boundaries
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
