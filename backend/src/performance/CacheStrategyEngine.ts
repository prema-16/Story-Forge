import { logger } from '../config/logger';

export interface CacheRule {
  pattern: string;
  ttlSeconds: number;
  strategy: 'cache-aside' | 'write-through' | 'read-through';
  cdnHeader: string;
}

export class CacheStrategyEngine {
  private rules: CacheRule[] = [
    { pattern: '/api/projects/*/preview', ttlSeconds: 300, strategy: 'cache-aside', cdnHeader: 'public, max-age=300' },
    { pattern: '/api/marketplace/plugins', ttlSeconds: 3600, strategy: 'read-through', cdnHeader: 'public, max-age=3600, s-maxage=86400' },
    { pattern: '/api/users/profile', ttlSeconds: 60, strategy: 'cache-aside', cdnHeader: 'private, no-cache' },
  ];

  getRule(path: string): CacheRule | undefined {
    return this.rules.find((r) => new RegExp(r.pattern.replace('*', '.*')).test(path));
  }

  getRules(): CacheRule[] {
    return [...this.rules];
  }
}

export const cacheStrategyEngine = new CacheStrategyEngine();
