import {
  IImageProvider,
  ImageGenerationOptions,
  ImageGenerationResult,
} from '../interfaces/IImageProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class StabilityAIProvider implements IImageProvider {
  readonly providerName = 'stability';
  readonly defaultModel = 'sd3-large';

  isAvailable(): boolean {
    return !!env.STABILITY_AI_API_KEY;
  }

  async generate(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult> {
    const start = Date.now();
    const apiKey = env.STABILITY_AI_API_KEY;

    if (!apiKey) throw new Error('[Stability AI] API key is missing');

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', this.mapRatio(options.size));

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[Stability AI] Request failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const base64 = data.image;
    const imageUrl = `data:image/png;base64,${base64}`;

    logger.debug(`[Stability AI] Image generated in ${Date.now() - start}ms`);

    return {
      imageUrl,
      base64,
      provider: this.providerName,
      model: options.model || this.defaultModel,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(options),
    };
  }

  async generateVariants(
    prompt: string,
    count: number,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.generate(`${prompt} variant ${i + 1}`, options));
    }
    return results;
  }

  estimateCost(options: ImageGenerationOptions = {}): number {
    return 0.035; // ~$0.035 per SD3 large image
  }

  private mapRatio(size?: string): string {
    if (size === '1024x1792') return '9:16';
    if (size === '1792x1024') return '16:9';
    return '16:9';
  }
}
