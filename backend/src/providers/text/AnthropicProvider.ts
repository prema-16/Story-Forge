import Anthropic from '@anthropic-ai/sdk';
import { ITextProvider, TextGenerationOptions, TextGenerationResult } from '../interfaces/ITextProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class AnthropicProvider implements ITextProvider {
  readonly providerName = 'anthropic';
  readonly defaultModel = 'claude-3-5-sonnet-20241022';
  readonly supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ];

  private client: Anthropic;

  constructor() {
    if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  isAvailable(): boolean {
    return !!env.ANTHROPIC_API_KEY;
  }

  async generate(prompt: string, options: TextGenerationOptions = {}): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model ?? this.defaultModel;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens ?? 4096,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      const promptTokens = response.usage.input_tokens;
      const completionTokens = response.usage.output_tokens;

      return {
        content,
        tokensUsed: promptTokens + completionTokens,
        model,
        provider: this.providerName,
        latencyMs: Date.now() - start,
        cost: this.estimateCost(promptTokens, completionTokens, model),
      };
    } catch (err) {
      logger.error(`[Anthropic] Generation failed:`, err);
      throw err;
    }
  }

  async generateStream(
    prompt: string,
    onChunk: (chunk: { text: string; isComplete: boolean; tokensUsed?: number }) => void,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = options.model ?? this.defaultModel;

    try {
      const stream = this.client.messages.stream({
        model,
        max_tokens: options.maxTokens ?? 4096,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
      });

      let fullText = '';
      stream.on('text', (text) => {
        fullText += text;
        onChunk({ text, isComplete: false });
      });

      const finalMessage = await stream.finalMessage();
      onChunk({ text: '', isComplete: true });

      const promptTokens = finalMessage.usage.input_tokens;
      const completionTokens = finalMessage.usage.output_tokens;

      return {
        content: fullText,
        tokensUsed: promptTokens + completionTokens,
        model,
        provider: this.providerName,
        latencyMs: Date.now() - start,
        cost: this.estimateCost(promptTokens, completionTokens, model),
      };
    } catch (err) {
      logger.error(`[Anthropic] Streaming failed:`, err);
      throw err;
    }
  }

  async generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<{ data: T; meta: Omit<TextGenerationResult, 'content'> }> {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON, no markdown, no explanation.`;
    const result = await this.generate(jsonPrompt, options);
    try {
      const cleaned = result.content.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleaned) as T;
      const { content, ...meta } = result;
      return { data, meta };
    } catch {
      throw new Error(`[Anthropic] Failed to parse JSON: ${result.content.slice(0, 200)}`);
    }
  }

  estimateCost(promptTokens: number, completionTokens: number, model = this.defaultModel): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
      'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
      'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
    };
    const p = pricing[model] ?? pricing['claude-3-5-sonnet-20241022'];
    return (promptTokens * p.input + completionTokens * p.output) / 1_000_000;
  }
}
