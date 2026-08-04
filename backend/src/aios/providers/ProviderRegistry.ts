import { IAIProvider, ProviderType, AIProviderResponse } from './interfaces';
import { CircuitBreaker } from './CircuitBreaker';
import { providerHealthTracker } from './ProviderHealth';
import { providerRouter, RoutingStrategy } from './Router';
import { logger } from '../../config/logger';

export class ProviderRegistry {
  private providers = new Map<string, IAIProvider>();
  private circuitBreakers = new Map<string, CircuitBreaker>();

  /**
   * Register a new AI provider plugin.
   */
  register(provider: IAIProvider): void {
    this.providers.set(provider.id, provider);
    this.circuitBreakers.set(provider.id, new CircuitBreaker(provider.id));
    logger.info(`[ProviderRegistry] Registered provider plugin: ${provider.name} (${provider.id})`);
  }

  /**
   * Unregister a provider plugin.
   */
  unregister(providerId: string): void {
    this.providers.delete(providerId);
    this.circuitBreakers.delete(providerId);
    logger.info(`[ProviderRegistry] Unregistered provider: ${providerId}`);
  }

  /**
   * Get a registered provider by ID.
   */
  get(providerId: string): IAIProvider | null {
    return this.providers.get(providerId) || null;
  }

  /**
   * List all registered providers, optionally filtered by type.
   */
  list(type?: ProviderType): IAIProvider[] {
    const all = Array.from(this.providers.values());
    if (!type) return all;
    return all.filter((p) => p.type === type);
  }

  /**
   * Execute a text generation request with automatic failover across available candidate providers.
   */
  async executeTextGeneration(
    prompt: string,
    options: { preferredProvider?: string; strategy?: RoutingStrategy } = {}
  ): Promise<AIProviderResponse<string>> {
    const candidates = this.list('text');
    if (candidates.length === 0) {
      throw new Error('[ProviderRegistry] No text generation providers registered.');
    }

    // Try preferred provider first if specified
    if (options.preferredProvider) {
      const preferred = this.get(options.preferredProvider);
      if (preferred && preferred.type === 'text') {
        const result = await this.tryExecuteProvider(preferred, (p) => p.generateText!(prompt, options));
        if (result) return result;
      }
    }

    // Router selection & failover cascade
    const selected = providerRouter.selectProvider(candidates, options.strategy || 'weighted');
    if (selected) {
      const result = await this.tryExecuteProvider(selected, (p) => p.generateText!(prompt, options));
      if (result) return result;
    }

    // Fallback cascade to any remaining healthy candidate
    for (const provider of candidates) {
      if (provider.id === selected?.id) continue;
      const result = await this.tryExecuteProvider(provider, (p) => p.generateText!(prompt, options));
      if (result) return result;
    }

    throw new Error('[ProviderRegistry] All text generation providers failed or circuit breakers are OPEN.');
  }

  /**
   * Helper to execute a provider call wrapped in CircuitBreaker and Health Tracker.
   */
  private async tryExecuteProvider<T>(
    provider: IAIProvider,
    action: (p: IAIProvider) => Promise<AIProviderResponse<T>>
  ): Promise<AIProviderResponse<T> | null> {
    const breaker = this.circuitBreakers.get(provider.id)!;
    const start = Date.now();

    try {
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) return null;

      const response = await breaker.execute(() => action(provider));
      const latency = Date.now() - start;

      providerHealthTracker.recordRequest(
        provider.id,
        latency,
        response.tokensUsed?.totalTokens || 0,
        response.costUSD || 0,
        true
      );
      providerHealthTracker.setCircuitState(provider.id, breaker.getState());

      return response;
    } catch (err) {
      const latency = Date.now() - start;
      providerHealthTracker.recordRequest(provider.id, latency, 0, 0, false);
      providerHealthTracker.setCircuitState(provider.id, breaker.getState());
      logger.warn(`[ProviderRegistry] Execution failed for '${provider.name}': ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Get complete metrics snapshot for all providers.
   */
  getMetrics() {
    return providerHealthTracker.getAllMetrics();
  }
}

export const providerRegistry = new ProviderRegistry();
