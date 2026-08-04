import { IAIProvider, ProviderCapability, AIProviderResponse } from '../interfaces';
import { env } from '../../../config/env';

export class GroqProvider implements IAIProvider {
  readonly id = 'groq';
  readonly name = 'Groq (Llama 3.3 70B)';
  readonly type = 'text';
  readonly supportedModels = ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    costPer1kInputTokens: 0.00059,
    costPer1kOutputTokens: 0.00079,
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.GROQ_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const model = (options.model as string) || 'llama-3.3-70b-versatile';

    const latencyMs = Math.floor(Math.random() * 80) + 40; // Ultra low latency
    return {
      success: true,
      data: `[Groq Llama 3.3 Ultra-Fast Response] Generated prompt: "${prompt.slice(0, 60)}..."`,
      providerName: this.name,
      modelName: model,
      tokensUsed: { inputTokens: 120, outputTokens: 220, totalTokens: 340 },
      latencyMs,
      costUSD: 0.0002,
    };
  }
}

export class DeepSeekProvider implements IAIProvider {
  readonly id = 'deepseek';
  readonly name = 'DeepSeek (DeepSeek-V3 / R1)';
  readonly type = 'text';
  readonly supportedModels = ['deepseek-chat', 'deepseek-reasoner'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 64000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: true,
    costPer1kInputTokens: 0.00014,
    costPer1kOutputTokens: 0.00028,
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.DEEPSEEK_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const model = (options.model as string) || 'deepseek-chat';

    const latencyMs = Math.floor(Math.random() * 150) + 90;
    return {
      success: true,
      data: `[DeepSeek Reasoning Response] Detailed logical breakdown for: "${prompt.slice(0, 60)}..."`,
      providerName: this.name,
      modelName: model,
      tokensUsed: { inputTokens: 140, outputTokens: 310, totalTokens: 450 },
      latencyMs,
      costUSD: 0.0001,
    };
  }
}
