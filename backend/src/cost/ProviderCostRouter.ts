import { logger } from '../config/logger';

export type AIProvider = 'gemini' | 'gpt4' | 'claude' | 'mistral';

export interface ProviderCostConfig {
  provider: AIProvider;
  costPerInputToken: number;    // USD
  costPerOutputToken: number;   // USD
  avgLatencyMs: number;
  qualityScore: number;         // 0-100
  available: boolean;
}

export interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  estimatedCostUSD: number;
  estimatedLatencyMs: number;
}

export class ProviderCostRouter {
  private providers: Map<AIProvider, ProviderCostConfig> = new Map([
    ['gemini', { provider: 'gemini', costPerInputToken: 0.000001, costPerOutputToken: 0.000002, avgLatencyMs: 1200, qualityScore: 94, available: true }],
    ['gpt4', { provider: 'gpt4', costPerInputToken: 0.00003, costPerOutputToken: 0.00006, avgLatencyMs: 2200, qualityScore: 96, available: true }],
    ['claude', { provider: 'claude', costPerInputToken: 0.000015, costPerOutputToken: 0.000075, avgLatencyMs: 1800, qualityScore: 95, available: true }],
    ['mistral', { provider: 'mistral', costPerInputToken: 0.000002, costPerOutputToken: 0.000006, avgLatencyMs: 900, qualityScore: 85, available: true }],
  ]);

  routeByCost(inputTokens: number, outputTokens: number, minQuality = 80): RoutingDecision {
    const available = Array.from(this.providers.values()).filter((p) => p.available && p.qualityScore >= minQuality);
    if (available.length === 0) throw new Error('No available providers meet quality requirements');

    const withCost = available.map((p) => ({
      ...p,
      totalCost: (p.costPerInputToken * inputTokens) + (p.costPerOutputToken * outputTokens),
    }));

    const cheapest = withCost.sort((a, b) => a.totalCost - b.totalCost)[0];

    logger.info(`[ProviderCostRouter] Routed to ${cheapest.provider} (cost: $${cheapest.totalCost.toFixed(6)}, latency: ${cheapest.avgLatencyMs}ms)`);
    return {
      provider: cheapest.provider,
      reason: `Lowest cost provider meeting quality >= ${minQuality}`,
      estimatedCostUSD: cheapest.totalCost,
      estimatedLatencyMs: cheapest.avgLatencyMs,
    };
  }

  routeByLatency(maxLatencyMs: number, minQuality = 80): RoutingDecision {
    const available = Array.from(this.providers.values())
      .filter((p) => p.available && p.avgLatencyMs <= maxLatencyMs && p.qualityScore >= minQuality)
      .sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);

    if (available.length === 0) throw new Error('No providers meet latency requirements');

    const fastest = available[0];
    return {
      provider: fastest.provider,
      reason: `Fastest provider within ${maxLatencyMs}ms SLA`,
      estimatedCostUSD: 0,
      estimatedLatencyMs: fastest.avgLatencyMs,
    };
  }

  markProviderUnavailable(provider: AIProvider): void {
    const config = this.providers.get(provider);
    if (config) {
      config.available = false;
      logger.warn(`[ProviderCostRouter] Provider '${provider}' marked unavailable — traffic rerouted`);
    }
  }

  getCostForecast(dailyRequests: number, avgInputTokens = 500, avgOutputTokens = 1000): Record<string, number> {
    const forecast: Record<string, number> = {};
    for (const [name, config] of this.providers.entries()) {
      const dailyCost = dailyRequests * ((config.costPerInputToken * avgInputTokens) + (config.costPerOutputToken * avgOutputTokens));
      forecast[name] = Math.round(dailyCost * 30 * 100) / 100; // Monthly
    }
    return forecast;
  }
}

export const providerCostRouter = new ProviderCostRouter();
