import { ProviderMetrics } from './interfaces';

export class ProviderHealthTracker {
  private metricsMap = new Map<string, ProviderMetrics>();

  getMetrics(providerId: string): ProviderMetrics {
    if (!this.metricsMap.has(providerId)) {
      this.metricsMap.set(providerId, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatencyMs: 0,
        totalTokensUsed: 0,
        totalCostUSD: 0,
        qualityScore: 1.0,
        lastHealthCheck: new Date().toISOString(),
        circuitState: 'closed',
      });
    }
    return this.metricsMap.get(providerId)!;
  }

  recordRequest(providerId: string, latencyMs: number, tokensUsed: number, costUSD: number, success: boolean): void {
    const metrics = this.getMetrics(providerId);
    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Moving average for latency
    metrics.averageLatencyMs = Math.round(
      (metrics.averageLatencyMs * (metrics.totalRequests - 1) + latencyMs) / metrics.totalRequests
    );

    metrics.totalTokensUsed += tokensUsed;
    metrics.totalCostUSD += costUSD;
    metrics.lastHealthCheck = new Date().toISOString();
  }

  updateQualityScore(providerId: string, score: number): void {
    const metrics = this.getMetrics(providerId);
    // Smooth quality score update (0.0 to 1.0)
    metrics.qualityScore = Math.min(1.0, Math.max(0.0, score));
  }

  setCircuitState(providerId: string, state: 'closed' | 'open' | 'half-open'): void {
    const metrics = this.getMetrics(providerId);
    metrics.circuitState = state;
  }

  getAllMetrics(): Record<string, ProviderMetrics> {
    const result: Record<string, ProviderMetrics> = {};
    for (const [id, m] of this.metricsMap.entries()) {
      result[id] = { ...m };
    }
    return result;
  }
}

export const providerHealthTracker = new ProviderHealthTracker();
