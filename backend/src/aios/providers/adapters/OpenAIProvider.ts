import { IAIProvider, ProviderCapability, AIProviderResponse } from '../interfaces';
import { env } from '../../../config/env';

export class OpenAIProvider implements IAIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI (GPT-4o)';
  readonly type = 'text';
  readonly supportedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    costPer1kInputTokens: 0.005,
    costPer1kOutputTokens: 0.015,
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const model = (options.model as string) || 'gpt-4o';

    if (env.ENABLE_MOCK_AI || !process.env.OPENAI_API_KEY) {
      const latencyMs = Math.floor(Math.random() * 300) + 150;
      const mockOutput = `[OpenAI ${model} Mock Response] Generated content based on prompt: "${prompt.slice(0, 60)}..."`;
      return {
        success: true,
        data: mockOutput,
        providerName: this.name,
        modelName: model,
        tokensUsed: { inputTokens: 120, outputTokens: 250, totalTokens: 370 },
        latencyMs,
        costUSD: 0.002,
      };
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: (options.systemPrompt as string) || 'You are an expert content generation assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: (options.temperature as number) ?? 0.7,
    });

    const latencyMs = Date.now() - start;
    const content = completion.choices[0]?.message?.content || '';
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    return {
      success: true,
      data: content,
      providerName: this.name,
      modelName: model,
      tokensUsed: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
      latencyMs,
      costUSD: (inputTokens / 1000) * this.capabilities.costPer1kInputTokens + (outputTokens / 1000) * this.capabilities.costPer1kOutputTokens,
    };
  }
}
