import { ITextProvider, TextGenerationOptions, TextGenerationResult } from '../interfaces/ITextProvider';
import { logger } from '../../config/logger';

/**
 * MockTextProvider — returns realistic-looking mock data for development/testing.
 * Never calls any external API. Simulates realistic latency.
 */
export class MockTextProvider implements ITextProvider {
  readonly providerName = 'mock';
  readonly defaultModel = 'mock-gpt-4o';
  readonly supportedModels = ['mock-gpt-4o'];

  isAvailable(): boolean {
    return true;
  }

  async generateStream(
    prompt: string,
    onChunk: (chunk: { text: string; isComplete: boolean; tokensUsed?: number }) => void,
    options: TextGenerationOptions = {}
  ): Promise<TextGenerationResult> {
    const fullText = options.responseFormat === 'json'
      ? this.generateMockJSON(prompt)
      : this.generateMockText(prompt);

    const words = fullText.split(' ');
    let current = '';
    const start = Date.now();

    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      current += word;
      onChunk({
        text: word,
        isComplete: i === words.length - 1,
      });
      await new Promise((r) => setTimeout(r, 20));
    }

    return {
      content: fullText,
      tokensUsed: Math.floor(fullText.length / 4),
      model: this.defaultModel,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost: 0,
    };
  }

  async generate(prompt: string, options: TextGenerationOptions = {}): Promise<TextGenerationResult> {
    const start = Date.now();

    // Simulate realistic API latency
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

    const content = options.responseFormat === 'json'
      ? this.generateMockJSON(prompt)
      : this.generateMockText(prompt);

    logger.debug(`[Mock] Generated text for prompt: ${prompt.slice(0, 60)}...`);

    return {
      content,
      tokensUsed: Math.floor(prompt.length / 4) + 250,
      model: this.defaultModel,
      provider: this.providerName,
      latencyMs: Date.now() - start,
      cost: 0,
    };
  }

  async generateJSON<T = Record<string, unknown>>(
    prompt: string,
    options: TextGenerationOptions = {}
  ): Promise<{ data: T; meta: Omit<TextGenerationResult, 'content'> }> {
    const result = await this.generate(prompt, { ...options, responseFormat: 'json' });
    const data = JSON.parse(result.content) as T;
    const { content, ...meta } = result;
    return { data, meta };
  }

  estimateCost(): number {
    return 0;
  }

  private extractTopicFromPrompt(prompt: string): string {
    const match = prompt.match(/(?:topic\/idea|prompt|idea|topic|about)[:\s]*"([^"]+)"/i)
               || prompt.match(/(?:topic\/idea|prompt|idea|topic|about)[:\s]*([^\n.]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    const cleaned = prompt.replace(/write a complete.*video script/i, '')
                          .replace(/you are an expert.*/i, '')
                          .replace(/return a json object.*/i, '')
                          .trim();
    return cleaned.slice(0, 60) || 'Creative Production Topic';
  }

  private generateMockText(prompt: string): string {
    const topic = this.extractTopicFromPrompt(prompt);
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('script') || lowerPrompt.includes('story')) {
      return `# ${topic}: The Deep Dive

## Introduction
In this documentary, we explore the extraordinary world of ${topic}. This comprehensive breakdown reveals the hidden mechanisms, history, and impact behind ${topic}.

## Chapter 1: The Foundations of ${topic}
Every story has a beginning. To understand ${topic}, we must first examine the fundamental forces and history that brought it to light.

## Chapter 2: The Core Dynamics of ${topic}
Moving deeper, ${topic} presents complex challenges and breakthrough insights that continue to captivate researchers and creators alike.

## Chapter 3: The Future of ${topic}
Looking toward the future, the evolution of ${topic} promises to reshape our understanding and create unprecedented opportunities.

## Ending
In conclusion, ${topic} stands as a testament to innovation and discovery.

## Outro
Subscribe for more deep-dive video breakdowns exploring cutting-edge topics.`;
    }

    if (lowerPrompt.includes('scene') || lowerPrompt.includes('breakdown')) {
      return `Scene breakdown generated for "${topic}" with 8 scenes covering the complete narrative arc.`;
    }

    return `High-quality AI-generated narrative response for "${topic}". Crafted to match specified genre, tone, and visual style.`;
  }

  private generateMockJSON(prompt: string): string {
    const topic = this.extractTopicFromPrompt(prompt);
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('scene')) {
      return JSON.stringify({
        scenes: Array.from({ length: 6 }, (_, i) => ({
          sceneNumber: i + 1,
          title: `Scene ${i + 1}: ${topic} Beat ${i + 1}`,
          duration: 45 + (i % 3) * 15,
          narration: `Narration for ${topic} scene ${i + 1} detailing key insights and dramatic story progression.`,
          visualDescription: `Cinematic 8k visual shot representing ${topic}, dynamic lighting and high detail framing.`,
          cameraMovement: ['Slow push in', 'Tracking shot', 'Orbit camera', 'Aerial wide'][i % 4],
          soundEffects: ['ambient atmospheric hum', 'subtle cinematic riser'],
          backgroundMusic: 'Cinematic documentary soundtrack',
          mood: 'dramatic',
          order: i + 1,
        })),
      });
    }

    if (lowerPrompt.includes('script')) {
      return JSON.stringify({
        title: `${topic}: The Full Story Explained`,
        introduction: `In this deep-dive exploration, we uncover the fascinating history, mechanics, and future of ${topic}.`,
        chapters: [
          { number: 1, title: `The Origins of ${topic}`, content: `To understand ${topic}, we start at the beginning where key discoveries first emerged...`, duration: 120, wordCount: 200 },
          { number: 2, title: `Inside ${topic}`, content: `Analyzing the core mechanics and breakthrough details of ${topic} in depth...`, duration: 180, wordCount: 280 },
          { number: 3, title: `The Legacy & Future of ${topic}`, content: `Looking ahead at how ${topic} continues to transform our world and influence the future...`, duration: 200, wordCount: 320 },
        ],
        ending: `In conclusion, ${topic} leaves a lasting impression that continues to inspire.`,
        outro: `Subscribe for more in-depth breakdowns on ${topic}!`,
        totalWordCount: 800,
        estimatedDuration: 500,
        tone: 'informative',
      });
    }

    if (lowerPrompt.includes('seo') || lowerPrompt.includes('youtube')) {
      return JSON.stringify({
        title: `${topic} EXPLAINED: Everything You Need To Know`,
        description: `Everything you need to know about ${topic}. Deep dive into the history, facts, and future of ${topic}.`,
        tags: [topic.toLowerCase(), 'documentary', 'explained', 'education', 'viral video'],
        hashtags: [`#${topic.replace(/[^a-zA-Z0-9]/g, '')}`, '#Explained', '#Documentary'],
        keywords: [`${topic.toLowerCase()} documentary`, `${topic.toLowerCase()} explained`, `learn ${topic.toLowerCase()}`],
        chapters: [
          { time: '0:00', title: `Introduction to ${topic}` },
          { time: '2:00', title: `The Origin` },
          { time: '5:00', title: `Deep Dive` },
          { time: '8:00', title: `Conclusion` },
        ],
      });
    }

    if (lowerPrompt.includes('thumbnail')) {
      return JSON.stringify({
        titleText: topic.toUpperCase().slice(0, 20),
        composition: `High-impact composition showcasing ${topic} with bold glowing typography`,
        colorPalette: ['#0f172a', '#7c3aed', '#ec4899', '#ffffff'],
        textPlacement: 'Center top, 3D embossed style with neon backlight',
        backgroundPrompt: `Atmospheric cinematic backdrop for ${topic}, high contrast, 8k render`,
        subjectPrompt: `Vivid detailed central element representing ${topic}`,
        moodPrompt: 'Epic, engaging, high CTR thumbnail aesthetic',
        fullPrompt: `Thumbnail image for ${topic}, ultra cinematic, 8k resolution, vibrant lighting, 1280x720`,
        visualHooks: [`Bold ${topic} visual`, 'Vibrant neon glow', 'High contrast rating'],
        clickThroughScore: 92,
      });
    }

    return JSON.stringify({
      result: `Mock response for ${topic}`,
      timestamp: new Date().toISOString(),
      provider: 'mock',
    });
  }
}
