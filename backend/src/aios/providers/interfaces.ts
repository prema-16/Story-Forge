/**
 * AIOS Provider Manager — Interfaces & Types
 */

export type ProviderType = 'text' | 'image' | 'video' | 'voice' | 'audio' | 'transcription';

export interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalTokensUsed: number;
  totalCostUSD: number;
  qualityScore: number; // 0.0 - 1.0
  lastHealthCheck: string;
  circuitState: 'closed' | 'open' | 'half-open';
}

export interface ProviderCapability {
  maxContextTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  costPerMediaUnit?: number; // e.g. per image/second of video
}

export interface AIProviderResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  providerName: string;
  modelName: string;
  tokensUsed: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  costUSD: number;
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly supportedModels: string[];
  readonly capabilities: ProviderCapability;
  
  isAvailable(): Promise<boolean>;
  generateText?(prompt: string, options?: Record<string, unknown>): Promise<AIProviderResponse<string>>;
  generateImage?(prompt: string, options?: Record<string, unknown>): Promise<AIProviderResponse<string>>;
  generateVideo?(prompt: string, options?: Record<string, unknown>): Promise<AIProviderResponse<string>>;
  generateVoice?(text: string, options?: Record<string, unknown>): Promise<AIProviderResponse<Buffer | string>>;
  transcribeAudio?(audioBuffer: Buffer, options?: Record<string, unknown>): Promise<AIProviderResponse<string>>;
}
