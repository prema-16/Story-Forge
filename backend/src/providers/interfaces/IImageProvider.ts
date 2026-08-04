export interface ImageGenerationOptions {
  model?: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  base64?: string;
  revisedPrompt?: string;
  provider: string;
  model: string;
  latencyMs: number;
  cost?: number;
}

export interface IImageProvider {
  readonly providerName: string;
  readonly defaultModel: string;

  generate(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
  generateVariants(
    prompt: string,
    count: number,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult[]>;
  isAvailable(): boolean;
  estimateCost(options?: ImageGenerationOptions): number;
}
