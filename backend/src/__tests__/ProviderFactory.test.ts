import { providerFactory } from '../providers/ProviderFactory';
import { MockTextProvider } from '../providers/text/MockTextProvider';
import { GroqProvider } from '../providers/text/GroqProvider';
import { DeepSeekProvider } from '../providers/text/DeepSeekProvider';
import { StabilityAIProvider } from '../providers/image/StabilityAIProvider';

describe('ProviderFactory Integration Tests', () => {
  beforeEach(() => {
    providerFactory.clearCache();
  });

  test('Fallback to MockTextProvider when no API keys are configured', () => {
    const textProvider = providerFactory.getTextProvider('groq');
    expect(textProvider).toBeDefined();
    // Since GROQ_API_KEY is not set in env, it should gracefully fall back to mock
    expect(textProvider.providerName).toBe('mock');
  });

  test('MockTextProvider handles text generation and streaming', async () => {
    const mockProvider = new MockTextProvider();
    expect(mockProvider.isAvailable()).toBe(true);

    const result = await mockProvider.generate('Write a test script about AI');
    expect(result.content).toBeDefined();
    expect(result.provider).toBe('mock');

    const chunks: string[] = [];
    const streamResult = await mockProvider.generateStream('Streaming test', (chunk) => {
      if (chunk.text) chunks.push(chunk.text);
    });

    expect(streamResult.content).toBeDefined();
    expect(chunks.length).toBeGreaterThan(0);
  });

  test('GroqProvider availability check', () => {
    const groq = new GroqProvider();
    expect(groq.providerName).toBe('groq');
    expect(groq.supportedModels).toContain('llama-3.3-70b-versatile');
    expect(groq.isAvailable()).toBe(false); // No key in test env
  });

  test('DeepSeekProvider availability check', () => {
    const deepseek = new DeepSeekProvider();
    expect(deepseek.providerName).toBe('deepseek');
    expect(deepseek.supportedModels).toContain('deepseek-chat');
    expect(deepseek.isAvailable()).toBe(false); // No key in test env
  });

  test('StabilityAIProvider availability check', () => {
    const stability = new StabilityAIProvider();
    expect(stability.providerName).toBe('stability');
    expect(stability.isAvailable()).toBe(false); // No key in test env
  });

  test('getAvailableProviders reports active providers correctly', () => {
    const status = providerFactory.getAvailableProviders();
    expect(status.text).toContain('mock');
    expect(status.image).toContain('mock');
    expect(status.video).toContain('mock');
    expect(status.voice).toContain('mock');
  });
});
