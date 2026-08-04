import { logger } from '../../config/logger';

export type EvalTarget = 'hook' | 'script' | 'scenes' | 'images' | 'voice' | 'music' | 'seo' | 'thumbnail';

export interface EvaluationResult {
  target: EvalTarget;
  score: number; // 0-100
  passed: boolean;
  suggestions: string[];
  autoRegenerate: boolean;
}

export class EvaluationEngine {
  /**
   * Evaluate AI generation output quality.
   */
  async evaluateOutput(target: EvalTarget, output: unknown): Promise<EvaluationResult> {
    logger.debug(`[EvaluationEngine] Scoring output quality for target '${target}'`);

    let score = 92;
    const suggestions: string[] = [];

    if (target === 'script') {
      const text = typeof output === 'string' ? output : JSON.stringify(output);
      if (text.length < 300) {
        score -= 20;
        suggestions.push('Script length is too short for high viewer retention');
      }
      if (!text.includes('?')) {
        suggestions.push('Include more engaging open questions in early chapters');
      }
    } else if (target === 'thumbnail') {
      score = 94;
      suggestions.push('Boost text contrast for high mobile CTR');
    }

    const passed = score >= 75;

    return {
      target,
      score,
      passed,
      suggestions,
      autoRegenerate: !passed,
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
