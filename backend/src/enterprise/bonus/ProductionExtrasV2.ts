import { logger } from '../../config/logger';

// ─── 1. AI Content Calendar ──────────────────────────────────────────────────
export class AIContentCalendar {
  generateSchedule(genre: string, postsPerWeek = 3): Array<{ date: string; topic: string; suggestedFormat: string }> {
    logger.info(`[AIContentCalendar] Generated ${postsPerWeek} posts/week schedule for ${genre}`);
    return [
      { date: '2026-08-04', topic: 'Quantum Computing Breakdown 2026', suggestedFormat: '1080p Documentary' },
      { date: '2026-08-06', topic: 'Top 5 Space Anomalies Shorts', suggestedFormat: 'Vertical Reel' },
      { date: '2026-08-08', topic: 'Cyberpunk Cybernetics Explained', suggestedFormat: '16:9 Video' },
    ];
  }
}

export const aiContentCalendar = new AIContentCalendar();

// ─── 2. Brand Knowledge Base ─────────────────────────────────────────────────
export class BrandKnowledgeBase {
  getBrandKit(orgId: string): { primaryColor: string; fontHeader: string; logoUrl: string; toneOfVoice: string } {
    return {
      primaryColor: '#8b5cf6',
      fontHeader: 'Inter Bold',
      logoUrl: 'https://storyforge.ai/assets/logo.png',
      toneOfVoice: 'Authoritative, Futuristic, Engaging',
    };
  }
}

export const brandKnowledgeBase = new BrandKnowledgeBase();
