import axios from 'axios';
import { IImageProvider, ImageGenerationOptions, ImageGenerationResult } from '../interfaces/IImageProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class HuggingFaceProvider implements IImageProvider {
  readonly providerName = 'huggingface';
  readonly defaultModel = env.HF_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';

  isAvailable(): boolean {
    return !!env.HF_TOKEN;
  }

  estimateCost(): number {
    return 0; // Hugging Face Free Tier
  }

  async generate(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    if (!env.HF_TOKEN) {
      throw new Error('[HuggingFaceProvider] HF_TOKEN is missing');
    }

    try {
      const url = `https://api-inference.huggingface.co/models/${model}`;
      const response = await axios.post(
        url,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 45000,
        }
      );

      const base64Image = Buffer.from(response.data).toString('base64');
      const dataUri = `data:image/png;base64,${base64Image}`;

      return {
        imageUrl: dataUri,
        base64: base64Image,
        revisedPrompt: prompt,
        provider: this.providerName,
        model,
        latencyMs: Date.now() - startTime,
        cost: 0,
      };
    } catch (err: any) {
      logger.error(`[HuggingFaceProvider] Generation failed: ${err.message}`);
      throw new Error(`[HuggingFaceProvider] Generation error: ${err.message}`);
    }
  }

  async generateVariants(
    prompt: string,
    count: number,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];
    for (let i = 0; i < count; i++) {
      const res = await this.generate(`${prompt} (variant ${i + 1})`, options);
      results.push(res);
    }
    return results;
  }
}
