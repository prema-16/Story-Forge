import { ProviderRegistry } from '../providers/ProviderRegistry';
import { OpenAIProvider } from '../providers/adapters/OpenAIProvider';
import { ClaudeProvider } from '../providers/adapters/ClaudeProvider';
import { CircuitBreaker } from '../providers/CircuitBreaker';

describe('AIOS Provider Manager — Unit Tests', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
    registry.register(new OpenAIProvider());
    registry.register(new ClaudeProvider());
  });

  it('should register and list text generation providers', () => {
    const textProviders = registry.list('text');
    expect(textProviders.length).toBe(2);
    expect(textProviders.map((p) => p.id)).toContain('openai');
    expect(textProviders.map((p) => p.id)).toContain('anthropic');
  });

  it('should execute text generation via ProviderRegistry with fallback', async () => {
    const result = await registry.executeTextGeneration('Test prompt for AIOS', { preferredProvider: 'openai' });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.latencyMs).toBeGreaterThan(0);
  });

  it('should trip CircuitBreaker to OPEN state after 5 consecutive failures', async () => {
    const cb = new CircuitBreaker('test-provider', { failureThreshold: 5, resetTimeoutMs: 1000 });

    for (let i = 0; i < 5; i++) {
      try {
        await cb.execute(async () => {
          throw new Error('API Error');
        });
      } catch {}
    }

    expect(cb.getState()).toBe('open');
  });
});
