import { logger } from '../config/logger';

export class VideoQualityScorer {
  score(resolutionPx: number, bitrateKbps: number, audioSampleRateHz = 48000): number {
    const resScore = resolutionPx >= 1920 ? 100 : 70;
    const bitScore = bitrateKbps >= 4000 ? 100 : 75;
    const audioScore = audioSampleRateHz >= 44100 ? 100 : 60;
    const total = Math.round((resScore * 0.4) + (bitScore * 0.4) + (audioScore * 0.2));
    logger.info(`[VideoQualityScorer] Video quality score: ${total}/100`);
    return total;
  }
}

export const videoQualityScorer = new VideoQualityScorer();
