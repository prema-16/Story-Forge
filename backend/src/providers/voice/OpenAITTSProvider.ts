import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import {
  IVoiceProvider,
  VoiceSynthesisOptions,
  VoiceSynthesisResult,
  VoiceOption,
} from '../interfaces/IVoiceProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const OPENAI_VOICES: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy', gender: 'neutral', accent: 'american', languages: ['en'] },
  { id: 'echo', name: 'Echo', gender: 'male', accent: 'american', languages: ['en'] },
  { id: 'fable', name: 'Fable', gender: 'male', accent: 'british', languages: ['en'] },
  { id: 'onyx', name: 'Onyx', gender: 'male', accent: 'american', languages: ['en'] },
  { id: 'nova', name: 'Nova', gender: 'female', accent: 'american', languages: ['en'] },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', accent: 'american', languages: ['en'] },
];

export class OpenAITTSProvider implements IVoiceProvider {
  readonly providerName = 'openai-tts';
  private client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY;
  }

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    const start = Date.now();
    const voiceId = OPENAI_VOICES.find(v => v.id === options.voiceId) ? options.voiceId : 'nova';

    logger.info(`[OpenAI TTS] Synthesizing ${text.length} chars with voice ${voiceId}`);

    const mp3Response = await this.client.audio.speech.create({
      model: 'tts-1-hd',
      voice: voiceId as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: Math.min(Math.max(options.speed || 1.0, 0.25), 4.0),
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
    const durationSeconds = Math.ceil((text.split(/\s+/).length / 150) * 60);

    const audioUrl = await this.uploadAudio(audioBuffer, voiceId);

    logger.info(`[OpenAI TTS] Done in ${Date.now() - start}ms`);

    return {
      audioBuffer,
      durationSeconds,
      provider: this.providerName,
      voiceId,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(text.length),
    };
  }

  async listVoices(): Promise<VoiceOption[]> {
    return OPENAI_VOICES;
  }

  async getVoice(voiceId: string): Promise<VoiceOption | null> {
    return OPENAI_VOICES.find(v => v.id === voiceId) || null;
  }

  estimateCost(textLength: number): number {
    // TTS-1-HD: $0.030 per 1K characters
    return (textLength / 1000) * 0.03;
  }

  private async uploadAudio(buffer: Buffer, voiceId: string): Promise<string> {
    try {
      if (!env.CLOUDINARY_CLOUD_NAME) return `data:audio/mpeg;base64,${buffer.toString('base64')}`;

      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'storyforge/voice',
            format: 'mp3',
            public_id: `tts_${voiceId}_${Date.now()}`,
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    } catch (err) {
      logger.warn('[OpenAI TTS] Upload failed:', (err as Error).message);
      throw err;
    }
  }
}
