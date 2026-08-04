import { logger } from '../config/logger';

export class ABTestingService {
  getVariant(experimentName: string, userId: string, variants: string[]): string {
    const hash = `${experimentName}:${userId}`.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const index = hash % variants.length;
    return variants[index];
  }
}

export const abTestingService = new ABTestingService();
