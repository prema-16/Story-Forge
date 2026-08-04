import OpenAI from 'openai';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import {
  IImageProvider,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../interfaces/IImageProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class DallE3Provider implements IImageProvider {
  readonly providerName = 'dalle';
  readonly defaultModel = 'dall-e-3';

  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required for DALL-E 3');
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY;
  }

  async generate(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
    const start = Date.now();
    const size = options.size || '1792x1024';
    const quality = options.quality || 'hd';
    const style = options.style || 'vivid';

    logger.info(`[DALL-E 3] Generating image — size: ${size}, quality: ${quality}`);

    const response = await this.client.images.generate({
      model: 'dall-e-3',
      prompt: this.buildPrompt(prompt),
      n: 1,
      size: size as any,
      quality,
      style,
      response_format: 'url',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) throw new Error('DALL-E 3 returned no image URL');

    const revisedPrompt = response.data?.[0]?.revised_prompt;

    // Upload to Cloudinary for permanent storage
    const cloudinaryUrl = await this.uploadToCloudinary(imageUrl);

    logger.info(`[DALL-E 3] Generated + uploaded in ${Date.now() - start}ms`);

    return {
      imageUrl: cloudinaryUrl,
      revisedPrompt,
      provider: this.providerName,
      model: this.defaultModel,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(options),
    };
  }

  async generateVariants(
    prompt: string,
    count: number,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult[]> {
    // DALL-E 3 only supports n=1, so generate sequentially
    const results: ImageGenerationResult[] = [];
    for (let i = 0; i < Math.min(count, 4); i++) {
      const result = await this.generate(prompt, options);
      results.push(result);
    }
    return results;
  }

  estimateCost(options?: ImageGenerationOptions): number {
    // DALL-E 3 HD 1024x1024: $0.080, 1792x1024 / 1024x1792: $0.120
    const size = options?.size || '1792x1024';
    const quality = options?.quality || 'hd';
    if (quality === 'hd' && size !== '1024x1024') return 0.12;
    if (quality === 'hd') return 0.08;
    return 0.04;
  }

  private buildPrompt(prompt: string): string {
    // Enhance prompt for YouTube thumbnail quality
    return `${prompt}. Photorealistic, ultra high quality, sharp details, professional photography lighting, 8K resolution, cinematic composition.`;
  }

  private async uploadToCloudinary(openaiUrl: string): Promise<string> {
    try {
      if (!env.CLOUDINARY_CLOUD_NAME) return openaiUrl;

      const result = await cloudinary.uploader.upload(openaiUrl, {
        folder: 'storyforge/thumbnails',
        resource_type: 'image',
        format: 'webp',
        quality: 'auto:best',
      });

      return result.secure_url;
    } catch (err) {
      logger.warn('[DALL-E 3] Cloudinary upload failed, returning OpenAI URL:', (err as Error).message);
      return openaiUrl;
    }
  }
}
