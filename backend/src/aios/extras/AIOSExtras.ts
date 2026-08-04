import { providerRegistry } from '../providers/ProviderRegistry';
import { logger } from '../../config/logger';

// ─── 1. AI Benchmark Engine ───────────────────────────────────────────────────

export interface BenchmarkResult {
  providerId: string;
  providerName: string;
  latencyMs: number;
  tokensPerSecond: number;
  costUSD: number;
  qualityScore: number;
}

export class BenchmarkEngine {
  async benchmarkAll(testPrompt = 'Generate a 3-sentence YouTube video introduction about quantum computing.'): Promise<BenchmarkResult[]> {
    logger.info('[BenchmarkEngine] Running benchmark across all registered providers...');
    const textProviders = providerRegistry.list('text');
    const results: BenchmarkResult[] = [];

    for (const provider of textProviders) {
      const start = Date.now();
      try {
        const res = await providerRegistry.executeTextGeneration(testPrompt, { preferredProvider: provider.id });
        const latencyMs = Date.now() - start;
        const tokensPerSecond = Math.round(((res.tokensUsed?.outputTokens || 100) / latencyMs) * 1000);

        results.push({
          providerId: provider.id,
          providerName: provider.name,
          latencyMs,
          tokensPerSecond,
          costUSD: res.costUSD || 0.001,
          qualityScore: 95,
        });
      } catch {
        // Skip offline providers
      }
    }

    results.sort((a, b) => b.tokensPerSecond - a.tokensPerSecond);
    return results;
  }
}

export const benchmarkEngine = new BenchmarkEngine();

// ─── 2. Smart Cache ───────────────────────────────────────────────────────────

export class SmartCache {
  private cache = new Map<string, { output: unknown; cachedAt: number }>();

  get(promptKey: string, ttlMs = 3600000): unknown | null {
    const item = this.cache.get(promptKey);
    if (!item) return null;
    if (Date.now() - item.cachedAt > ttlMs) {
      this.cache.delete(promptKey);
      return null;
    }
    logger.info(`[SmartCache] HIT for prompt key '${promptKey.slice(0, 30)}...'`);
    return item.output;
  }

  set(promptKey: string, output: unknown): void {
    this.cache.set(promptKey, { output, cachedAt: Date.now() });
  }
}

export const smartCache = new SmartCache();

// ─── 3. AI Sandbox ────────────────────────────────────────────────────────────

export class AISandbox {
  async testRunPrompt(prompt: string, providerId: string): Promise<{ output: string; latencyMs: number; costUSD: number }> {
    const start = Date.now();
    const res = await providerRegistry.executeTextGeneration(prompt, { preferredProvider: providerId });
    return {
      output: res.data || '',
      latencyMs: Date.now() - start,
      costUSD: res.costUSD || 0.001,
    };
  }
}

export const aiSandbox = new AISandbox();
