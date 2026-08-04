import { IAIProvider, ProviderCapability, AIProviderResponse } from '../interfaces';
import { env } from '../../../config/env';

export class GeminiProvider implements IAIProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini (Gemini 1.5 Pro)';
  readonly type = 'text';
  readonly supportedModels = ['gemini-1.5-pro', 'gemini-1.5-flash'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 1000000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    costPer1kInputTokens: 0.00125,
    costPer1kOutputTokens: 0.005,
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.GEMINI_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const model = (options.model as string) || 'gemini-1.5-pro';

    if (env.ENABLE_MOCK_AI || !process.env.GEMINI_API_KEY) {
      const latencyMs = Math.floor(Math.random() * 200) + 100;
      return {
        success: true,
        data: `[Gemini 1.5 Pro Mock Response] High-context story breakdown for: "${prompt.slice(0, 60)}..."`,
        providerName: this.name,
        modelName: model,
        tokensUsed: { inputTokens: 100, outputTokens: 280, totalTokens: 380 },
        latencyMs,
        costUSD: 0.0008,
      };
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelInstance = genAI.getGenerativeModel({ model });

    const result = await modelInstance.generateContent(prompt);
    const latencyMs = Date.now() - start;
    const responseText = result.response.text();

    return {
      success: true,
      data: responseText,
      providerName: this.name,
      modelName: model,
      tokensUsed: { inputTokens: 150, outputTokens: 300, totalTokens: 450 },
      latencyMs,
      costUSD: 0.001,
    };
  }
}
