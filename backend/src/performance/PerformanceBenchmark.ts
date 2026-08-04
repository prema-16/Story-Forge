import { logger } from '../config/logger';

export interface PerformanceSample {
  route: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
}

export class PerformanceBenchmark {
  private samples: PerformanceSample[] = [];
  private readonly p95Target = 200; // ms
  private readonly p99Target = 500; // ms

  record(route: string, method: string, statusCode: number, latencyMs: number): void {
    this.samples.push({ route, method, statusCode, latencyMs, timestamp: new Date().toISOString() });
    if (this.samples.length > 50000) this.samples.shift();
  }

  getPercentile(sortedArr: number[], pct: number): number {
    if (sortedArr.length === 0) return 0;
    return sortedArr[Math.floor(sortedArr.length * pct)] || 0;
  }

  getRouteStats(route?: string): Array<{
    route: string;
    count: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    p95Passing: boolean;
    avgMs: number;
    errorRate: number;
  }> {
    const filtered = route ? this.samples.filter((s) => s.route === route) : this.samples;
    const grouped = new Map<string, PerformanceSample[]>();

    for (const s of filtered) {
      if (!grouped.has(s.route)) grouped.set(s.route, []);
      grouped.get(s.route)!.push(s);
    }

    return Array.from(grouped.entries()).map(([r, sampleList]) => {
      const latencies = sampleList.map((s) => s.latencyMs).sort((a, b) => a - b);
      const p95 = this.getPercentile(latencies, 0.95);
      const errors = sampleList.filter((s) => s.statusCode >= 400).length;

      return {
        route: r,
        count: sampleList.length,
        p50Ms: this.getPercentile(latencies, 0.50),
        p95Ms: p95,
        p99Ms: this.getPercentile(latencies, 0.99),
        p95Passing: p95 <= this.p95Target,
        avgMs: Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length),
        errorRate: Math.round((errors / sampleList.length) * 100),
      };
    });
  }

  getSLACompliance(): { p95TargetMs: number; p95Passing: boolean; overallPassPct: number } {
    const stats = this.getRouteStats();
    const passing = stats.filter((s) => s.p95Passing).length;
    return {
      p95TargetMs: this.p95Target,
      p95Passing: stats.every((s) => s.p95Passing),
      overallPassPct: stats.length ? Math.round((passing / stats.length) * 100) : 100,
    };
  }
}

export const performanceBenchmark = new PerformanceBenchmark();
