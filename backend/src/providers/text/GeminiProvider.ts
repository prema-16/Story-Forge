import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  ITextProvider,
  TextGenerationOptions,
  TextGenerationResult,
} from '../interfaces/ITextProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class GeminiProvider implements ITextProvider {
  readonly providerName = 'gemini';
  readonly defaultModel = 'gemini-1.5-pro';
  readonly supportedModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];

  private client: GoogleGenerativeAI;

  constructor() {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  isAvailable(): boolean {
    return !!env.GEMINI_API_KEY;
  }

  private getModel(modelName?: string): GenerativeModel {
    return this.client.getGenerativeModel({
      model: modelName || this.defaultModel,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });
  }

  async generate(prompt: string, options: TextGenerationOptions = {}): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = this.getModel(options.model);

    const systemInstruction = options.systemPrompt || '';
    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
      },
    });

    const content = result.response.text();
    const usage = result.response.usageMetadata;
    const tokensUsed = (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0);

    logger.debug(`[Gemini] ${options.model || this.defaultModel} — ${tokensUsed} tokens`);

    return {
      content,
      tokensUsed,
      model: options.model || this.defaultModel,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(usage?.promptTokenCount || 0, usage?.candidatesTokenCount || 0),
    };
  }

  async generateStream(
    prompt: string,
    onChunk: (chunk: { text: string; isComplete: boolean; tokensUsed?: number }) => void,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const start = Date.now();
    const model = this.getModel(options.model);

    const systemInstruction = options.systemPrompt || '';
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

    const resultStream = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain',
      },
    });

    let fullText = '';
    for await (const chunk of resultStream.stream) {
      const text = chunk.text();
      if (text) {
        fullText += text;
        onChunk({ text, isComplete: false });
      }
    }

    onChunk({ text: '', isComplete: true });

    const promptTokens = Math.floor(fullPrompt.length / 4);
    const completionTokens = Math.floor(fullText.length / 4);
    const tokensUsed = promptTokens + completionTokens;

    return {
      content: fullText,
      tokensUsed,
      model: options.model || this.defaultModel,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(promptTokens, completionTokens),
    };
  }

  async generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<{ data: T; meta: Omit<TextGenerationResult, 'content'> }> {
    const result = await this.generate(prompt, { ...options, responseFormat: 'json' });
    const cleaned = result.content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const data = JSON.parse(cleaned) as T;
    const { content: _content, ...meta } = result;
    return { data, meta };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    // Gemini 1.5 Pro pricing: $3.50/$10.50 per 1M tokens (>128K context)
    return ((promptTokens + completionTokens) / 1_000_000) * 7;
  }
}
