import { logger } from '../config/logger';

export interface UserPreferences {
  userId: string;
  preferredTone: 'formal' | 'casual' | 'dramatic' | 'enthusiastic';
  preferredPacing: 'fast' | 'moderate' | 'slow';
  brandColors: string[];
}

export class PersonalizationEngine {
  private prefs = new Map<string, UserPreferences>();

  savePreferences(userId: string, preferences: Partial<UserPreferences>): UserPreferences {
    const existing = this.prefs.get(userId) || {
      userId,
      preferredTone: 'casual',
      preferredPacing: 'moderate',
      brandColors: ['#6366f1'],
    };
    const updated = { ...existing, ...preferences };
    this.prefs.set(userId, updated);
    logger.info(`[PersonalizationEngine] Saved preferences for user ${userId}`);
    return updated;
  }

  getPreferences(userId: string): UserPreferences {
    return this.prefs.get(userId) || {
      userId,
      preferredTone: 'casual',
      preferredPacing: 'moderate',
      brandColors: ['#6366f1'],
    };
  }
}

export const personalizationEngine = new PersonalizationEngine();
