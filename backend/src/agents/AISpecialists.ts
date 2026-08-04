import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';

export interface SEOOutput {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  keywords: string[];
  chapters: Array<{ time: string; title: string }>;
  titleScore: number;
  descriptionScore: number;
}

export interface ThumbnailOutput {
  titleText: string;
  composition: string;
  colorPalette: string[];
  textPlacement: string;
  backgroundPrompt: string;
  subjectPrompt: string;
  moodPrompt: string;
  fullPrompt: string;
  negativePrompt: string;
  clickThroughScore: number;
  visualHooks: string[];
}

/**
 * AIThumbnailDesigner — creates compelling thumbnail concepts optimized for CTR.
 */
export class AIThumbnailDesigner extends BaseAgent {
  readonly agentName = 'ai-thumbnail-designer';
  readonly description = 'Designs thumbnail concepts optimized for click-through rate';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { scriptTitle, genre, style, targetAudience } = payload as {
      scriptTitle: string;
      genre: string;
      style: string;
      targetAudience?: string;
    };

    const systemPrompt = this.buildSystemPrompt(
      `You are a YouTube thumbnail design expert who has analyzed millions of high-CTR thumbnails.
You understand the psychology of what makes people click: curiosity gaps, emotional faces, bold text, contrast.
You design thumbnails for the ${genre} genre that get 8-15% CTR.
Always optimize for mobile visibility (thumbnails appear small on phones).`,
      context.userMemory
    );

    const prompt = `Design a high-CTR YouTube thumbnail for this video:

Title: "${scriptTitle}"
Genre: ${genre}
Style: ${style}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Return JSON:
{
  "titleText": "2-4 word bold title text for thumbnail (UPPERCASE)",
  "composition": "detailed layout description",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "textPlacement": "top-left | top-center | top-right | bottom-left | bottom-center | bottom-right",
  "backgroundPrompt": "background scene prompt for AI image generation",
  "subjectPrompt": "main subject prompt",
  "moodPrompt": "overall mood and atmosphere",
  "fullPrompt": "complete AI image generation prompt for 1280x720 thumbnail",
  "negativePrompt": "blurry, low quality, text, watermark, multiple subjects",
  "clickThroughScore": estimated CTR score 0-100,
  "visualHooks": ["hook1", "hook2", "hook3"]
}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON<ThumbnailOutput>(prompt, {
      systemPrompt,
      maxTokens: 1000,
      temperature: 0.85,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

/**
 * AISEOSpecialist — generates complete YouTube SEO metadata.
 */
export class AISEOSpecialist extends BaseAgent {
  readonly agentName = 'ai-seo-specialist';
  readonly description = 'Generates YouTube title, description, tags, hashtags, and chapters';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { scriptTitle, scriptSummary, genre, scenes } = payload as {
      scriptTitle: string;
      scriptSummary: string;
      genre: string;
      scenes?: Array<{ title: string; duration: number }>;
    };

    const systemPrompt = this.buildSystemPrompt(
      `You are a YouTube SEO expert with 10+ years optimizing content for discoverability.
You understand the YouTube algorithm: title click-through, watch time, keyword density.
You write descriptions that rank and titles that get clicked.
Genre focus: ${genre}.`,
      context.userMemory
    );

    // Build chapters from scenes if available
    const chapterContext = scenes
      ? scenes
          .reduce(
            (acc, scene, i) => {
              const cumulativeSeconds = acc.cumulative;
              const minutes = Math.floor(cumulativeSeconds / 60);
              const secs = cumulativeSeconds % 60;
              acc.chapters.push({
                time: `${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`,
                title: scene.title,
              });
              acc.cumulative += scene.duration;
              return acc;
            },
            { chapters: [] as Array<{ time: string; title: string }>, cumulative: 0 }
          )
          .chapters
      : [];

    const prompt = `Generate complete YouTube SEO metadata for this ${genre} video:

Title: "${scriptTitle}"
Summary: "${scriptSummary}"

Return JSON:
{
  "title": "optimized YouTube title (60 chars max, curiosity + keyword)",
  "description": "full 300+ word YouTube description with keywords, timestamps, and CTA",
  "tags": ["tag1", "tag2", ...20 tags],
  "hashtags": ["#hashtag1", "#hashtag2", ...8 hashtags],
  "keywords": ["keyword1", "keyword2", ...10 primary keywords],
  "chapters": [
    { "time": "0:00", "title": "Introduction" },
    ...
  ],
  "titleScore": SEO score 0-100,
  "descriptionScore": SEO score 0-100
}

${chapterContext.length > 0 ? `Use these chapter times: ${JSON.stringify(chapterContext)}` : ''}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON<SEOOutput>(prompt, {
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

/**
 * AIQAReviewer — performs quality review of all generated content.
 */
export class AIQAReviewer extends BaseAgent {
  readonly agentName = 'ai-qa-reviewer';
  readonly description = 'Reviews quality, continuity, grammar, and prompt quality across all content';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { script, scenes, prompts } = payload as {
      script?: { title: string; totalWordCount: number; chapters: unknown[] };
      scenes?: Array<{ title: string; narration: string; duration: number }>;
      prompts?: Array<{ fullPrompt: string }>;
    };

    const systemPrompt = `You are a senior content quality assurance reviewer for a professional video production studio.
You check: grammar, narrative continuity, scene pacing, prompt quality, and missing elements.
Be constructive and specific.`;

    const reviewItems: string[] = [];
    if (script) reviewItems.push(`Script: ${script.title} (${script.totalWordCount} words, ${script.chapters.length} chapters)`);
    if (scenes) reviewItems.push(`Scenes: ${scenes.length} scenes, total duration: ${scenes.reduce((s, sc) => s + sc.duration, 0)}s`);
    if (prompts) reviewItems.push(`Prompts: ${prompts.length} cinematic prompts`);

    const prompt = `Perform a quality review of this video project content:

${reviewItems.join('\n')}

${scenes ? `Scene narrations sample:\n${scenes.slice(0, 3).map((s) => `- ${s.title}: "${s.narration.slice(0, 100)}..."`).join('\n')}` : ''}

Return JSON:
{
  "overallScore": 0-100,
  "issues": [
    { "type": "grammar | continuity | timing | prompt | missing", "severity": "low | medium | high", "description": "issue description", "scene": "affected scene or null" }
  ],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["improvement1", "improvement2"],
  "approved": true/false
}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON(prompt, {
      systemPrompt,
      maxTokens: 1500,
      temperature: 0.5,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

/**
 * AIPublisher — prepares the final export package and metadata.
 */
export class AIPublisher extends BaseAgent {
  readonly agentName = 'ai-publisher';
  readonly description = 'Prepares export package with metadata and publishing-ready files';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    // Publisher mostly coordinates with the export service
    const { projectId, title, seo } = payload as {
      projectId: string;
      title: string;
      seo: SEOOutput;
    };

    const manifest = {
      projectId,
      title,
      exportedAt: new Date().toISOString(),
      youtubeReady: true,
      files: {
        script: 'script.txt',
        scenes: 'scenes.json',
        prompts: 'prompts.json',
        voiceAudio: 'audio/narration.mp3',
        subtitlesSrt: 'subtitles/narration.srt',
        subtitlesVtt: 'subtitles/narration.vtt',
        thumbnailPrompt: 'thumbnail/prompt.txt',
        seoMetadata: 'seo/metadata.json',
        videoClips: 'video/',
      },
      seoSnapshot: seo,
    };

    return {
      data: manifest as T,
      tokensUsed: 0,
      provider: 'internal',
      cost: 0,
    };
  }
}

// Register all agents
export const aiThumbnailDesigner = new AIThumbnailDesigner();
export const aiSEOSpecialist = new AISEOSpecialist();
export const aiQAReviewer = new AIQAReviewer();
export const aiPublisher = new AIPublisher();

agentRegistry.register(aiThumbnailDesigner);
agentRegistry.register(aiSEOSpecialist);
agentRegistry.register(aiQAReviewer);
agentRegistry.register(aiPublisher);
