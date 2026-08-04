import { IAIProvider, ProviderCapability, AIProviderResponse } from '../interfaces';
import { env } from '../../../config/env';

// ─── ElevenLabs Voice Provider ───────────────────────────────────────────────

export class ElevenLabsProvider implements IAIProvider {
  readonly id = 'elevenlabs';
  readonly name = 'ElevenLabs Multilingual v2';
  readonly type = 'voice';
  readonly supportedModels = ['eleven_multilingual_v2', 'eleven_turbo_v2_5'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 10000,
    supportsStreaming: true,
    supportsVision: false,
    supportsFunctionCalling: false,
    costPer1kInputTokens: 0.15,
    costPer1kOutputTokens: 0.15,
    costPerMediaUnit: 0.05, // per second
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.ELEVENLABS_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateVoice(text: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const latencyMs = Math.floor(Math.random() * 400) + 200;
    const mockAudioUrl = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';

    return {
      success: true,
      data: mockAudioUrl,
      providerName: this.name,
      modelName: 'eleven_multilingual_v2',
      tokensUsed: { inputTokens: text.length, outputTokens: 0, totalTokens: text.length },
      latencyMs,
      costUSD: 0.03,
    };
  }
}

// ─── Stability AI Image Provider ─────────────────────────────────────────────

export class StabilityProvider implements IAIProvider {
  readonly id = 'stability';
  readonly name = 'Stability AI (SDXL / Ultra)';
  readonly type = 'image';
  readonly supportedModels = ['sdxl-1.0', 'stable-diffusion-ultra'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 2000,
    supportsStreaming: false,
    supportsVision: false,
    supportsFunctionCalling: false,
    costPer1kInputTokens: 0,
    costPer1kOutputTokens: 0,
    costPerMediaUnit: 0.04, // per image
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.STABILITY_AI_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateImage(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const latencyMs = Math.floor(Math.random() * 800) + 500;
    const mockImageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 10))}/1280/720`;

    return {
      success: true,
      data: mockImageUrl,
      providerName: this.name,
      modelName: 'sdxl-1.0',
      tokensUsed: { inputTokens: prompt.length, outputTokens: 0, totalTokens: prompt.length },
      latencyMs,
      costUSD: 0.04,
    };
  }
}

// ─── Runway Video Provider ───────────────────────────────────────────────────

export class RunwayProvider implements IAIProvider {
  readonly id = 'runway';
  readonly name = 'Runway Gen-3 Alpha';
  readonly type = 'video';
  readonly supportedModels = ['gen-3-alpha', 'gen-2'];

  readonly capabilities: ProviderCapability = {
    maxContextTokens: 2000,
    supportsStreaming: false,
    supportsVision: true,
    supportsFunctionCalling: false,
    costPer1kInputTokens: 0,
    costPer1kOutputTokens: 0,
    costPerMediaUnit: 0.25, // per 5s clip
  };

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.RUNWAY_API_KEY || env.ENABLE_MOCK_AI);
  }

  async generateVideo(prompt: string, options: Record<string, unknown> = {}): Promise<AIProviderResponse<string>> {
    const start = Date.now();
    const latencyMs = Math.floor(Math.random() * 1500) + 1000;
    const mockVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    return {
      success: true,
      data: mockVideoUrl,
      providerName: this.name,
      modelName: 'gen-3-alpha',
      tokensUsed: { inputTokens: prompt.length, outputTokens: 0, totalTokens: prompt.length },
      latencyMs,
      costUSD: 0.25,
    };
  }
}
