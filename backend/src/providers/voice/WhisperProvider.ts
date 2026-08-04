import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

export interface TranscriptionResult {
  text: string;
  durationSeconds?: number;
  segments?: Array<{ id: number; start: number; end: number; text: string }>;
  words?: Array<{ word: string; start: number; end: number }>;
  language?: string;
  provider: string;
  latencyMs: number;
}

export class WhisperProvider {
  readonly providerName = 'whisper';
  private client: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY;
  }

  async transcribe(
    audioStreamOrFile: any,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const start = Date.now();

    if (!this.client) {
      throw new Error('[Whisper] OpenAI API key is missing');
    }

    try {
      const response: any = await this.client.audio.transcriptions.create({
        file: audioStreamOrFile,
        model: 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature ?? 0,
        response_format: options.responseFormat || 'verbose_json',
        timestamp_granularities: ['segment', 'word'],
      });

      logger.debug(`[Whisper] Transcription completed in ${Date.now() - start}ms`);

      return {
        text: typeof response === 'string' ? response : response.text,
        durationSeconds: response.duration,
        segments: response.segments?.map((s: any) => ({
          id: s.id,
          start: s.start,
          end: s.end,
          text: s.text,
        })),
        words: response.words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        })),
        language: response.language,
        provider: this.providerName,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      logger.error(`[Whisper] Transcription failed:`, err);
      throw err;
    }
  }
}
