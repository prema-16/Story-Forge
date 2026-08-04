import { IAIProvider, ProviderType } from './interfaces';
import { providerHealthTracker } from './ProviderHealth';
import { logger } from '../../config/logger';

export type RoutingStrategy = 'quality' | 'cost' | 'latency' | 'weighted';

export class ProviderRouter {
  /**
   * Select the best candidate provider from an array of available providers based on strategy.
   */
  selectProvider(providers: IAIProvider[], strategy: RoutingStrategy = 'quality'): IAIProvider | null {
    if (providers.length === 0) return null;
    if (providers.length === 1) return providers[0];

    const scored = providers.map((p) => {
      const metrics = providerHealthTracker.getMetrics(p.id);
      let score = 0;

      switch (strategy) {
        case 'latency':
          // Lower latency = higher score
          score = 10000 / (metrics.averageLatencyMs || 100);
          break;

        case 'cost':
          // Lower input/output token cost = higher score
          const avgCost = (p.capabilities.costPer1kInputTokens + p.capabilities.costPer1kOutputTokens) / 2;
          score = 100 / (avgCost || 0.001);
          break;

        case 'quality':
          // Quality score (0-1) * success rate
          const successRate = metrics.totalRequests > 0 ? metrics.successfulRequests / metrics.totalRequests : 1.0;
          score = metrics.qualityScore * 100 * successRate;
          break;

        case 'weighted':
        default:
          const sRate = metrics.totalRequests > 0 ? metrics.successfulRequests / metrics.totalRequests : 1.0;
          const latScore = 1000 / (metrics.averageLatencyMs || 200);
          score = metrics.qualityScore * 50 + sRate * 30 + latScore * 20;
          break;
      }

      return { provider: p, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    logger.debug(`[ProviderRouter] Strategy '${strategy}' selected '${scored[0].provider.name}' (score: ${scored[0].score.toFixed(2)})`);

    return scored[0].provider;
  }
}

export const providerRouter = new ProviderRouter();
