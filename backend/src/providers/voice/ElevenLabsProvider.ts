import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import {
  IVoiceProvider,
  VoiceSynthesisOptions,
  VoiceSynthesisResult,
  VoiceOption,
} from '../interfaces/IVoiceProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels: { gender?: string; accent?: string; description?: string };
  preview_url: string;
}

export class ElevenLabsProvider implements IVoiceProvider {
  readonly providerName = 'elevenlabs';

  constructor() {
    if (!env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is required');
  }

  isAvailable(): boolean {
    return !!env.ELEVENLABS_API_KEY;
  }

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    const start = Date.now();
    logger.info(`[ElevenLabs] Synthesizing ${text.length} chars with voice ${options.voiceId}`);

    // Request with timestamps for subtitle generation
    const response = await axios.post(
      `${ELEVENLABS_BASE}/text-to-speech/${options.voiceId}/with-timestamps`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.speed ? Math.min(Math.max(options.speed - 1, 0), 1) : 0,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        timeout: 120_000,
      }
    );

    const audioBase64: string = response.data.audio_base64;
    const alignment = response.data.alignment; // word-level timestamps

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const durationSeconds = this.estimateDuration(text, options.speed);

    // Upload to Cloudinary
    const audioUrl = await this.uploadAudio(audioBuffer, options.voiceId);

    logger.info(`[ElevenLabs] Synthesized in ${Date.now() - start}ms → ${audioUrl}`);

    return {
      audioBuffer,
      durationSeconds,
      provider: this.providerName,
      voiceId: options.voiceId,
      latencyMs: Date.now() - start,
      cost: this.estimateCost(text.length),
      // Attach alignment data for subtitle generation
      ...(alignment && { alignment }),
    } as VoiceSynthesisResult & { alignment?: unknown };
  }

  async listVoices(language?: string): Promise<VoiceOption[]> {
    const response = await axios.get(`${ELEVENLABS_BASE}/voices`, {
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY! },
    });

    const voices: ElevenLabsVoice[] = response.data.voices || [];

    return voices.map((v) => ({
      id: v.voice_id,
      name: v.name,
      gender: (v.labels?.gender as 'male' | 'female' | 'neutral') || 'neutral',
      accent: v.labels?.accent,
      description: v.labels?.description,
      previewUrl: v.preview_url,
      languages: language ? [language] : ['en'],
    }));
  }

  async getVoice(voiceId: string): Promise<VoiceOption | null> {
    try {
      const response = await axios.get(`${ELEVENLABS_BASE}/voices/${voiceId}`, {
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY! },
      });
      const v: ElevenLabsVoice = response.data;
      return {
        id: v.voice_id,
        name: v.name,
        gender: (v.labels?.gender as 'male' | 'female' | 'neutral') || 'neutral',
        accent: v.labels?.accent,
        description: v.labels?.description,
        previewUrl: v.preview_url,
        languages: ['en'],
      };
    } catch {
      return null;
    }
  }

  estimateCost(textLength: number): number {
    // ElevenLabs: ~$0.30 per 1K characters (Creator plan)
    return (textLength / 1000) * 0.3;
  }

  private estimateDuration(text: string, speed?: number): number {
    // Average English speech: ~150 words per minute
    const wordCount = text.split(/\s+/).length;
    const wpm = 150 * (speed || 1.0);
    return Math.ceil((wordCount / wpm) * 60);
  }

  private async uploadAudio(buffer: Buffer, voiceId: string): Promise<string> {
    try {
      if (!env.CLOUDINARY_CLOUD_NAME) {
        // Return data URI if no Cloudinary
        return `data:audio/mpeg;base64,${buffer.toString('base64')}`;
      }

      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video', // Cloudinary uses 'video' type for audio
            folder: 'storyforge/voice',
            format: 'mp3',
            public_id: `voice_${voiceId}_${Date.now()}`,
          },
          (error, result) => {
            if (error || !result) reject(error || new Error('Upload failed'));
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    } catch (err) {
      logger.warn('[ElevenLabs] Cloudinary upload failed:', (err as Error).message);
      throw err;
    }
  }
}
