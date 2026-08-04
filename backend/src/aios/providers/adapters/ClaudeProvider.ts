import { IAIProvider, ProviderCapability, AIProviderResponse } from '../interfaces';
import { env } from '../../../config/env';

export class ClaudeProvider implements IAIProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic Claude (Claude 3.5 Sonnet)';
  readonly type = 'text';
  readonly supportedModels = ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.ANTHROPIC_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const model = (options.model as string) || 'claude-3-5-sonnet-20241022';

    if (env.ENABLE_MOCK_AI || !process.env.ANTHROPIC_API_KEY) {
      const latencyMs = Math.floor(Math.random() * 250) + 120;
      return {
        success: true,
        data: `[Claude 3.5 Sonnet Mock Response] Analytical script output for prompt: "${prompt.slice(0, 60)}..."`,
        providerName: this.name,
        modelName: model,
        tokensUsed: { inputTokens: 150, outputTokens: 300, totalTokens: 450 },
        latencyMs,
        costUSD: 0.0015,
      };
    }

    const { Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model,
      max_tokens: (options.maxTokens as number) || 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const latencyMs = Date.now() - start;
    const textBlock = response.content[0];
    const text = textBlock.type === 'text' ? textBlock.text : '';

    return {
      success: true,
      data: text,
      providerName: this.name,
      modelName: model,
      tokensUsed: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      latencyMs,
      costUSD: (response.usage.input_tokens / 1000) * this.capabilities.costPer1kInputTokens + (response.usage.output_tokens / 1000) * this.capabilities.costPer1kOutputTokens,
    };
  }
}
