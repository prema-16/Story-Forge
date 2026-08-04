import { logger } from '../config/logger';

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface MetricSample {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: string;
}

export interface LatencyBucket {
  route: string;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  requestCount: number;
}

export class MetricsCollector {
  private samples: MetricSample[] = [];
  private latencyRecords = new Map<string, number[]>(); // route -> [latencies]

  record(name: string, value: number, type: MetricType = 'gauge', labels: Record<string, string> = {}): void {
    this.samples.push({ name, type, value, labels, timestamp: new Date().toISOString() });
    if (this.samples.length > 10000) {
      this.samples.shift();
    }
  }

  recordLatency(route: string, latencyMs: number): void {
    if (!this.latencyRecords.has(route)) {
      this.latencyRecords.set(route, []);
    }
    const arr = this.latencyRecords.get(route)!;
    arr.push(latencyMs);
    if (arr.length > 1000) arr.shift();
  }

  getLatencyBuckets(): LatencyBucket[] {
    const buckets: LatencyBucket[] = [];
    for (const [route, latencies] of this.latencyRecords.entries()) {
      const sorted = [...latencies].sort((a, b) => a - b);
      const len = sorted.length;
      buckets.push({
        route,
        p50Ms: sorted[Math.floor(len * 0.5)] || 0,
        p95Ms: sorted[Math.floor(len * 0.95)] || 0,
        p99Ms: sorted[Math.floor(len * 0.99)] || 0,
        requestCount: len,
      });
    }
    return buckets;
  }

  recordSystemMetrics(cpuPct: number, memoryMb: number, gpuUtilPct = 0): void {
    this.record('system_cpu_pct', cpuPct, 'gauge', { host: 'storyforge-api' });
    this.record('system_memory_mb', memoryMb, 'gauge', { host: 'storyforge-api' });
    this.record('system_gpu_util_pct', gpuUtilPct, 'gauge', { host: 'storyforge-gpu' });
  }

  recordQueueMetric(queueName: string, depth: number, workers: number): void {
    this.record('queue_depth', depth, 'gauge', { queue: queueName });
    this.record('queue_active_workers', workers, 'gauge', { queue: queueName });
  }

  recordAIProviderLatency(provider: string, latencyMs: number, success: boolean): void {
    this.record('ai_provider_latency_ms', latencyMs, 'histogram', { provider, success: String(success) });
  }

  getPrometheusOutput(): string {
    const lines: string[] = ['# StoryForge AI V3 Prometheus Metrics\n'];
    const grouped = new Map<string, MetricSample[]>();

    for (const s of this.samples.slice(-500)) {
      if (!grouped.has(s.name)) grouped.set(s.name, []);
      grouped.get(s.name)!.push(s);
    }

    for (const [name, sampleList] of grouped.entries()) {
      const latest = sampleList[sampleList.length - 1];
      const labelStr = Object.entries(latest.labels).map(([k, v]) => `${k}="${v}"`).join(',');
      lines.push(`# TYPE ${name} ${latest.type}`);
      lines.push(`${name}{${labelStr}} ${latest.value}`);
    }

    return lines.join('\n');
  }

  getSummary(): Record<string, unknown> {
    const latencies = this.getLatencyBuckets();
    return {
      totalSamples: this.samples.length,
      trackedRoutes: latencies.length,
      latencyBuckets: latencies,
      topSlowRoutes: latencies.sort((a, b) => b.p95Ms - a.p95Ms).slice(0, 5),
    };
  }
}

export const metricsCollector = new MetricsCollector();
