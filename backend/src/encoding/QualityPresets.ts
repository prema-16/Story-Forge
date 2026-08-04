export type QualityPresetName = 'draft' | 'standard' | 'high' | 'lossless' | 'custom';

export interface QualityPreset {
  name: QualityPresetName;
  crf: number; // Constant Rate Factor (lower = higher quality)
  videoBitrate: string;
  audioBitrate: string;
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow';
}

export const QUALITY_PRESETS: Record<QualityPresetName, QualityPreset> = {
  draft: {
    name: 'draft',
    crf: 28,
    videoBitrate: '2M',
    audioBitrate: '128k',
    preset: 'ultrafast',
  },
  standard: {
    name: 'standard',
    crf: 23,
    videoBitrate: '8M',
    audioBitrate: '192k',
    preset: 'medium',
  },
  high: {
    name: 'high',
    crf: 18,
    videoBitrate: '16M',
    audioBitrate: '320k',
    preset: 'slow',
  },
  lossless: {
    name: 'lossless',
    crf: 0,
    videoBitrate: '50M',
    audioBitrate: '320k',
    preset: 'veryslow',
  },
  custom: {
    name: 'custom',
    crf: 20,
    videoBitrate: '10M',
    audioBitrate: '256k',
    preset: 'medium',
  },
};
