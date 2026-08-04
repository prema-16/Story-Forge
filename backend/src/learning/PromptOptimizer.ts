import { logger } from '../config/logger';

export class PromptOptimizer {
  optimize(basePrompt: string, tone: string): string {
    const optimized = `[Tone: ${tone}] [Style: High Engagement] ${basePrompt}. Ensure hook within first 3 seconds and clear call to action at the end.`;
    logger.info(`[PromptOptimizer] Optimized prompt for tone '${tone}'`);
    return optimized;
  }
}

export const promptOptimizer = new PromptOptimizer();
