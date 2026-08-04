import { logger } from '../config/logger';

export class SEOScorer {
  score(title: string, description: string, tags: string[]): { score: number; recommendations: string[] } {
    const recs: string[] = [];
    let s = 100;

    if (title.length < 40 || title.length > 70) {
      s -= 15;
      recs.push('Title length should be between 40 and 70 characters for optimal click-through.');
    }
    if (description.length < 120) {
      s -= 20;
      recs.push('Description should be at least 120 characters long.');
    }
    if (tags.length < 5) {
      s -= 15;
      recs.push('Add at least 5 relevant tags.');
    }

    logger.info(`[SEOScorer] SEO Score: ${s}/100`);
    return { score: Math.max(0, s), recommendations: recs };
  }
}

export const seoScorer = new SEOScorer();
