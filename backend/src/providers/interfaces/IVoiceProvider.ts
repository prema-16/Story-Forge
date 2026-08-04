export interface VoiceSynthesisOptions {
  voiceId: string;
  emotion?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number;
  stability?: number; // 0 - 1 (ElevenLabs)
  similarityBoost?: number; // 0 - 1 (ElevenLabs)
  language?: string;
}

export interface VoiceSynthesisResult {
  audioBuffer: Buffer;
  durationSeconds: number;
  provider: string;
  voiceId: string;
  latencyMs: number;
  cost?: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  description?: string;
  previewUrl?: string;
  languages: string[];
}

export interface IVoiceProvider {
  readonly providerName: string;

  synthesize(text: string, options: VoiceSynthesisOptions): Promise<VoiceSynthesisResult>;
  listVoices(language?: string): Promise<VoiceOption[]>;
  getVoice(voiceId: string): Promise<VoiceOption | null>;
  isAvailable(): boolean;
  estimateCost(textLength: number): number; // per character
}
