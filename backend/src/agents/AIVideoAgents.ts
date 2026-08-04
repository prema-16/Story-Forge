import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';
import { providerFactory } from '../providers/ProviderFactory';
import { logger } from '../config/logger';

export interface VideoDirectorOutput {
  jobId: string;
  provider: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTimeSeconds: number;
  videoUrl?: string;
  creditsUsed: number;
}

/**
 * AIVideoDirector — creates video generation jobs and monitors their progress.
 * Delegates to the configured video provider (Runway, Kling, mock, etc.)
 */
export class AIVideoDirector extends BaseAgent {
  readonly agentName = 'ai-video-director';
  readonly description = 'Submits video generation jobs, monitors progress, handles retries';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { prompt, negativePrompt, durationSeconds, aspectRatio, provider: videoProvider } = payload as {
      prompt: string;
      negativePrompt?: string;
      durationSeconds: number;
      aspectRatio: string;
      provider?: string;
    };

    const video = providerFactory.getVideoProvider(videoProvider);

    const { jobId, estimatedTimeSeconds } = await video.submitJob(
      prompt,
      negativePrompt ?? 'blurry, low quality, distorted, watermark',
      { duration: durationSeconds, aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1' }
    );

    logger.info(`[AIVideoDirector] Job submitted: ${jobId} via ${video.providerName}, est. ${estimatedTimeSeconds}s`);

    const output: VideoDirectorOutput = {
      jobId,
      provider: video.providerName,
      status: 'queued',
      estimatedTimeSeconds,
      creditsUsed: video.estimateCost(durationSeconds),
    };

    return {
      data: output as T,
      tokensUsed: 0,
      provider: video.providerName,
      cost: video.estimateCost(durationSeconds),
    };
  }

  /**
   * Poll job status — called separately (from BullMQ worker)
   */
  async checkJob(jobId: string, providerName?: string) {
    const video = providerFactory.getVideoProvider(providerName);
    return video.checkJobStatus(jobId);
  }
}

/**
 * AIVideoEditor — plans post-processing: transitions, captions, effects, color grading.
 */
export class AIVideoEditor extends BaseAgent {
  readonly agentName = 'ai-video-editor';
  readonly description = 'Plans transitions, effects, captions, and color grading for video assembly';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const { scenes, style, genre } = payload as {
      scenes: Array<{ sceneNumber: number; duration: number; mood: string }>;
      style: string;
      genre: string;
    };

    const systemPrompt = `You are a professional video editor with expertise in documentary filmmaking.
You plan the post-production details for AI-generated video clips.
Genre: ${genre}. Style: ${style}.`;

    const prompt = `Plan the video editing for these ${scenes.length} scenes:

${scenes.map((s) => `Scene ${s.sceneNumber}: ${s.duration}s, mood: ${s.mood}`).join('\n')}

Return JSON:
{
  "editingPlan": [
    {
      "sceneNumber": 1,
      "transitionIn": "cut | fade | dissolve | wipe | zoom",
      "transitionOut": "cut | fade | dissolve",
      "effects": ["slow motion", "color pop", "vignette"],
      "colorGrade": "preset name",
      "captionStyle": "minimal | bold | outlined | none",
      "musicVolume": 0.0-1.0,
      "voiceVolume": 0.0-1.0
    }
  ],
  "globalSettings": {
    "colorGradePreset": "teal-orange | noir | vintage | bright | muted",
    "backgroundMusicTrack": "description of ideal music",
    "subtitleFont": "Montserrat | Roboto | Impact",
    "subtitleColor": "#ffffff",
    "subtitleOutline": true
  }
}`;

    const provider = this.getTextProvider(context.preferredTextProvider);
    const result = await provider.generateJSON(prompt, {
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.6,
    });

    return {
      data: result.data as T,
      tokensUsed: result.meta.tokensUsed,
      provider: result.meta.provider,
      cost: result.meta.cost ?? 0,
    };
  }
}

export const aiVideoDirector = new AIVideoDirector();
export const aiVideoEditor = new AIVideoEditor();

agentRegistry.register(aiVideoDirector);
agentRegistry.register(aiVideoEditor);
