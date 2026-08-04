import { logger } from '../config/logger';

export interface IndexRecommendation {
  collection: string;
  fields: Record<string, 1 | -1>;
  reason: string;
  estimatedImprovementPct: number;
}

export interface QueryProfile {
  query: string;
  durationMs: number;
  collection: string;
  indexUsed: boolean;
}

export class DatabaseOptimizer {
  private queryProfiles: QueryProfile[] = [];

  private recommendations: IndexRecommendation[] = [
    { collection: 'projects', fields: { userId: 1, createdAt: -1 }, reason: 'Dashboard project listing query', estimatedImprovementPct: 82 },
    { collection: 'auditlogs', fields: { userId: 1, createdAt: -1 }, reason: 'Audit log pagination for user', estimatedImprovementPct: 75 },
    { collection: 'projects', fields: { status: 1, renderQuality: 1 }, reason: 'Production hub queue filtering', estimatedImprovementPct: 68 },
    { collection: 'notifications', fields: { userId: 1, read: 1 }, reason: 'Unread notification count query', estimatedImprovementPct: 90 },
    { collection: 'sessions', fields: { userId: 1, expiresAt: 1 }, reason: 'Session expiry cleanup job', estimatedImprovementPct: 70 },
    { collection: 'organizations', fields: { slug: 1 }, reason: 'Organization lookup by slug', estimatedImprovementPct: 95, },
  ];

  recordQuery(query: string, collection: string, durationMs: number, indexUsed: boolean): void {
    this.queryProfiles.push({ query, collection, durationMs, indexUsed });
    if (durationMs > 100) {
      logger.warn(`[DatabaseOptimizer] SLOW QUERY on '${collection}' (${durationMs}ms, index=${indexUsed}): ${query.substring(0, 80)}`);
    }
  }

  getRecommendations(): IndexRecommendation[] {
    return [...this.recommendations];
  }

  getSlowQueries(thresholdMs = 100): QueryProfile[] {
    return this.queryProfiles.filter((q) => q.durationMs > thresholdMs);
  }

  generateIndexDDL(): string[] {
    return this.recommendations.map((rec) => {
      const fields = Object.entries(rec.fields).map(([k, v]) => `${k}: ${v}`).join(', ');
      return `db.${rec.collection}.createIndex({ ${fields} }, { background: true }) // ${rec.reason}`;
    });
  }

  getOptimizationReport(): Record<string, unknown> {
    const slow = this.getSlowQueries();
    const withoutIndex = slow.filter((q) => !q.indexUsed);

    return {
      totalQueries: this.queryProfiles.length,
      slowQueries: slow.length,
      queriesWithoutIndex: withoutIndex.length,
      recommendedIndexes: this.recommendations.length,
      estimatedAvgImprovementPct: Math.round(this.recommendations.reduce((s, r) => s + r.estimatedImprovementPct, 0) / this.recommendations.length),
    };
  }
}

export const databaseOptimizer = new DatabaseOptimizer();
