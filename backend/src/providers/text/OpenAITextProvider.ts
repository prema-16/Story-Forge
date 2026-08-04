import OpenAI from 'openai';
import {
  ITextProvider,
  TextGenerationOptions,
  TextGenerationResult,
} from '../interfaces/ITextProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },        // per 1K tokens
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
};

export class OpenAITextProvider implements ITextProvider {
  readonly providerName = 'openai';
  readonly defaultModel = env.DEFAULT_TEXT_MODEL || 'gpt-4o';
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY;
  }

  async generate(prompt: string, options: TextGenerationOptions = {}): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model || this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;
    const cost = this.estimateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      model
    );

    logger.debug(`[OpenAI] ${model} — ${tokensUsed} tokens — $${cost.toFixed(4)}`);

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
    onChunk: (chunk: { text: string; isComplete: boolean; tokensUsed?: number }) => void,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model || this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const stream = await this.client.chat.completions.create({
      model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullText += text;
        onChunk({ text, isComplete: false });
      }
    }

    onChunk({ text: '', isComplete: true });

    const promptTokens = Math.floor(prompt.length / 4);
    const completionTokens = Math.floor(fullText.length / 4);
    const tokensUsed = promptTokens + completionTokens;
    const cost = this.estimateCost(promptTokens, completionTokens, model);

    return {
      content: fullText,
      tokensUsed,
      model,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost,
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
    const rates = MODEL_COSTS[m] || MODEL_COSTS['gpt-4o'];
    return (promptTokens / 1000) * rates.input + (completionTokens / 1000) * rates.output;
  }
}
