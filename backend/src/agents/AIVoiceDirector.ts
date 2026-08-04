import { BaseAgent, AgentContext, AgentResult } from './base/BaseAgent';
import { agentRegistry } from './base/AgentRegistry';
import { providerFactory } from '../providers/ProviderFactory';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';

export interface VoiceDirectorOutput {
  voiceId: string;
  voiceName: string;
  provider: string;
  audioUrl?: string;
  durationSeconds: number;
  waveformData?: number[];
  subtitles: { srt: string; vtt: string; txt: string };
  creditsUsed: number;
}

/**
 * AIVoiceDirector — selects the best voice for a project and synthesizes narration.
 * Routes to the appropriate voice provider based on user preferences.
 */
export class AIVoiceDirector extends BaseAgent {
  readonly agentName = 'ai-voice-director';
  readonly description = 'Selects voice, synthesizes narration, generates subtitles';

  protected async execute<T>(
    context: AgentContext,
    payload: Record<string, unknown>
  ): Promise<Omit<AgentResult<T>, 'success' | 'latencyMs'>> {
    const {
      text,
      voiceId,
      voiceName,
      provider: voiceProvider,
      speed = 1.0,
      emotion = 'neutral',
      language = 'en',
      projectId,
    } = payload as {
      text: string;
      voiceId: string;
      voiceName: string;
      provider?: string;
      speed?: number;
      emotion?: string;
      language?: string;
      projectId: string;
    };

    const voice = providerFactory.getVoiceProvider(
      voiceProvider ?? (context.userMemory?.preferredVoiceProvider as string | undefined)
    );

    // Select voice
    const resolvedVoiceId = voiceId ?? (context.userMemory?.preferredVoiceId as string) ?? 'mock-rachel';

    // Synthesize
    const synthesis = await voice.synthesize(text, {
      voiceId: resolvedVoiceId,
      emotion,
      speed,
      language,
    });

    // Upload to Cloudinary if configured
    let audioUrl: string | undefined;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult = await cloudinary.uploader.upload(
          `data:audio/mpeg;base64,${synthesis.audioBuffer.toString('base64')}`,
          {
            resource_type: 'video', // Cloudinary uses 'video' for audio
            folder: `storyforge/projects/${projectId}/voice`,
            public_id: `narration-${Date.now()}`,
          }
        );
        audioUrl = uploadResult.secure_url;
      } catch (err) {
        logger.warn('[AIVoiceDirector] Cloudinary upload failed:', err);
      }
    }

    if (!audioUrl) {
      audioUrl = `data:audio/mpeg;base64,${synthesis.audioBuffer.toString('base64')}`;
    }

    // Generate subtitles from word timing estimation
    const subtitles = this.generateSubtitles(text, synthesis.durationSeconds);

    // Simple waveform approximation (40 data points)
    const waveformData = Array.from({ length: 40 }, () =>
      Math.random() * 0.8 + 0.1
    );

    const output: VoiceDirectorOutput = {
      voiceId: resolvedVoiceId,
      voiceName: voiceName ?? 'Rachel',
      provider: voice.providerName,
      audioUrl,
      durationSeconds: synthesis.durationSeconds,
      waveformData,
      subtitles,
      creditsUsed: Math.ceil(text.length / 100), // per 100 chars
    };

    return {
      data: output as T,
      tokensUsed: 0,
      provider: voice.providerName,
      cost: synthesis.cost ?? 0,
    };
  }

  private generateSubtitles(text: string, durationSeconds: number): {
    srt: string;
    vtt: string;
    txt: string;
  } {
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    const timePerSentence = durationSeconds / sentences.length;

    const srtLines: string[] = [];
    const vttLines: string[] = ['WEBVTT', ''];

    sentences.forEach((sentence, i) => {
      const start = i * timePerSentence;
      const end = start + timePerSentence;
      const trimmed = sentence.trim();

      const srtStart = this.formatSRTTime(start);
      const srtEnd = this.formatSRTTime(end);

      srtLines.push(`${i + 1}\n${srtStart} --> ${srtEnd}\n${trimmed}\n`);
      vttLines.push(`${this.formatVTTTime(start)} --> ${this.formatVTTTime(end)}\n${trimmed}\n`);
    });

    return {
      srt: srtLines.join('\n'),
      vtt: vttLines.join('\n'),
      txt: sentences.map((s) => s.trim()).join('\n'),
    };
  }

  private formatSRTTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  private formatVTTTime(seconds: number): string {
    return this.formatSRTTime(seconds).replace(',', '.');
  }
}

export const aiVoiceDirector = new AIVoiceDirector();
agentRegistry.register(aiVoiceDirector);
