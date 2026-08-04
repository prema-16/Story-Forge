/**
 * ITextProvider — interface all text/LLM providers must implement.
 * Switching providers requires only changing the config, not the business logic.
 */
export interface TextGenerationOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
  responseFormat?: 'text' | 'json';
}

export interface TextGenerationResult {
  content: string;
  tokensUsed: number;
  model: string;
  provider: string;
  latencyMs: number;
  cost?: number;
}

export interface TextStreamChunk {
  text: string;
  isComplete: boolean;
  tokensUsed?: number;
}

export interface ITextProvider {
  readonly providerName: string;
  readonly defaultModel: string;
  readonly supportedModels: string[];

  generate(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult>;
  generateStream(
    prompt: string,
    onChunk: (chunk: TextStreamChunk) => void,
    options?: TextGenerationOptions
  ): Promise<TextGenerationResult>;
  generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options?: TextGenerationOptions
  ): Promise<{ data: T; meta: Omit<TextGenerationResult, 'content'> }>;
  isAvailable(): boolean;
  estimateCost(promptTokens: number, completionTokens: number, model?: string): number;
}

