import { logger } from '../config/logger';

export class ThumbnailScorer {
  predictCTR(contrastRatio: number, textLegibilityPct: number, faceDetected: boolean): { ctrPct: number; score: number } {
    let base = 5.0;
    if (contrastRatio >= 4.5) base += 1.5;
    if (textLegibilityPct >= 80) base += 1.2;
    if (faceDetected) base += 1.3;

    const score = Math.min(100, Math.round(base * 10));
    logger.info(`[ThumbnailScorer] Predicted CTR: ${base.toFixed(1)}% (score: ${score}/100)`);
    return { ctrPct: Number(base.toFixed(1)), score };
  }
}

export const thumbnailScorer = new ThumbnailScorer();
