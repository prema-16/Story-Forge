import { providerRegistry } from './ProviderRegistry';
import { OpenAIProvider } from './adapters/OpenAIProvider';
import { ClaudeProvider } from './adapters/ClaudeProvider';
import { GeminiProvider } from './adapters/GeminiProvider';
import { GroqProvider, DeepSeekProvider } from './adapters/GroqProvider';
import { ElevenLabsProvider, StabilityProvider, RunwayProvider } from './adapters/MediaProviders';

export * from './interfaces';
export * from './CircuitBreaker';
export * from './ProviderHealth';
export * from './Router';
export * from './ProviderRegistry';

/**
 * Bootstrap default provider plugins into ProviderRegistry.
 */
export function bootstrapProviders(): void {
  providerRegistry.register(new OpenAIProvider());
  providerRegistry.register(new ClaudeProvider());
  providerRegistry.register(new GeminiProvider());
  providerRegistry.register(new GroqProvider());
  providerRegistry.register(new DeepSeekProvider());
  providerRegistry.register(new ElevenLabsProvider());
  providerRegistry.register(new StabilityProvider());
  providerRegistry.register(new RunwayProvider());
}

bootstrapProviders();
