import { IImageProvider, ImageGenerationOptions, ImageGenerationResult } from '../interfaces/IImageProvider';

export class MockImageProvider implements IImageProvider {
  readonly providerName = 'mock';
  readonly defaultModel = 'mock-dalle-3';

  isAvailable(): boolean {
    return true;
  }

  async generate(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));

    // Return a real placeholder image URL (picsum.photos)
    const seed = Math.floor(Math.random() * 1000);
    const [width, height] = (options.size ?? '1024x1024').split('x').map(Number);

    return {
      imageUrl: `https://picsum.photos/seed/${seed}/${width}/${height}`,
      revisedPrompt: prompt,
      provider: this.providerName,
      model: this.defaultModel,
      latencyMs: 1200,
      cost: 0,
    };
  }

  async generateVariants(
    prompt: string,
    count: number,
    options: ImageGenerationOptions = {}
  ): Promise<ImageGenerationResult[]> {
    const results: ImageGenerationResult[] = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.generate(prompt, options));
    }
    return results;
  }

  estimateCost(): number {
    return 0;
  }
}
