import { logger } from '../config/logger';

export interface SystemHealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0–100
  details?: string;
}

export interface SystemHealthReport {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: string;
  components: SystemHealthComponent[];
  availabilityPct: number;
  recommendations: string[];
}

export class HealthScoreEngine {
  private componentWeights: Record<string, number> = {
    api: 0.25,
    ai_providers: 0.20,
    database: 0.20,
    queue: 0.15,
    storage: 0.10,
    regions: 0.10,
  };

  calculateHealthScore(components: SystemHealthComponent[]): SystemHealthReport {
    let weightedScore = 0;
    let totalWeight = 0;

    for (const comp of components) {
      const weight = this.componentWeights[comp.name] || 0.05;
      weightedScore += comp.score * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    const grade = overallScore >= 95 ? 'A' : overallScore >= 85 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 50 ? 'D' : 'F';

    const recommendations: string[] = [];
    for (const comp of components) {
      if (comp.score < 80) {
        recommendations.push(`${comp.name}: ${comp.details || 'Investigate degraded component'}`);
      }
    }

    const report: SystemHealthReport = {
      overallScore,
      grade,
      timestamp: new Date().toISOString(),
      availabilityPct: 99.95,
      components,
      recommendations,
    };

    logger.info(`[HealthScoreEngine] System Health Score: ${overallScore}/100 (Grade: ${grade})`);
    return report;
  }

  generateSampleReport(): SystemHealthReport {
    return this.calculateHealthScore([
      { name: 'api', status: 'healthy', score: 98, details: 'p95 latency 142ms' },
      { name: 'ai_providers', status: 'healthy', score: 96, details: 'All providers operational' },
      { name: 'database', status: 'healthy', score: 99, details: 'MongoDB replica set healthy' },
      { name: 'queue', status: 'healthy', score: 97, details: 'BullMQ depth 0, workers active' },
      { name: 'storage', status: 'healthy', score: 100, details: 'Cloudinary & S3 operational' },
      { name: 'regions', status: 'healthy', score: 100, details: 'All 6 regions healthy' },
    ]);
  }
}

export const healthScoreEngine = new HealthScoreEngine();
