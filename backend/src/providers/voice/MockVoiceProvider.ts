import { IVoiceProvider, VoiceSynthesisOptions, VoiceSynthesisResult, VoiceOption } from '../interfaces/IVoiceProvider';
import { logger } from '../../config/logger';

/**
 * MockVoiceProvider — returns a silent/blank audio buffer for development.
 * Simulates ElevenLabs-compatible voice list.
 */
export class MockVoiceProvider implements IVoiceProvider {
  readonly providerName = 'mock';

  private mockVoices: VoiceOption[] = [
    { id: 'mock-rachel', name: 'Rachel', gender: 'female', accent: 'American', description: 'Warm documentary narrator', languages: ['en'] },
    { id: 'mock-adam', name: 'Adam', gender: 'male', accent: 'British', description: 'Deep authoritative narrator', languages: ['en'] },
    { id: 'mock-bella', name: 'Bella', gender: 'female', accent: 'American', description: 'Clear and engaging', languages: ['en', 'es'] },
    { id: 'mock-josh', name: 'Josh', gender: 'male', accent: 'American', description: 'Young energetic voice', languages: ['en'] },
    { id: 'mock-elli', name: 'Elli', gender: 'female', accent: 'American', description: 'Soft and expressive', languages: ['en'] },
    { id: 'mock-sam', name: 'Sam', gender: 'neutral', description: 'Neutral professional voice', languages: ['en'] },
  ];

  isAvailable(): boolean {
    return true;
  }

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<VoiceSynthesisResult> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    // Create a minimal valid MP3 buffer (44 bytes header) for dev purposes
    const mp3Header = Buffer.from([
      0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    const wordCount = text.split(/\s+/).length;
    const durationSeconds = wordCount / (options.speed ?? 1.0) / 2.5; // ~150 WPM

    logger.debug(`[MockVoice] Synthesized ${wordCount} words for voice: ${options.voiceId}`);

    return {
      audioBuffer: mp3Header,
      durationSeconds,
      provider: this.providerName,
      voiceId: options.voiceId,
      latencyMs: 700,
      cost: 0,
    };
  }

  async listVoices(language?: string): Promise<VoiceOption[]> {
    if (language) {
      return this.mockVoices.filter((v) => v.languages.includes(language));
    }
    return this.mockVoices;
  }

  async getVoice(voiceId: string): Promise<VoiceOption | null> {
    return this.mockVoices.find((v) => v.id === voiceId) ?? null;
  }

  estimateCost(textLength: number): number {
    return 0; // Free in mock mode
  }
}
