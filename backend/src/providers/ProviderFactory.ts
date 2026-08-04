import { ITextProvider } from './interfaces/ITextProvider';
import { IImageProvider } from './interfaces/IImageProvider';
import { IVideoProvider } from './interfaces/IVideoProvider';
import { IVoiceProvider } from './interfaces/IVoiceProvider';

import { OpenAITextProvider } from './text/OpenAITextProvider';
import { AnthropicProvider } from './text/AnthropicProvider';
import { GeminiProvider } from './text/GeminiProvider';
import { GroqProvider } from './text/GroqProvider';
import { DeepSeekProvider } from './text/DeepSeekProvider';
import { MockTextProvider } from './text/MockTextProvider';

import { DallE3Provider } from './image/DallE3Provider';
import { StabilityAIProvider } from './image/StabilityAIProvider';
import { MockImageProvider } from './image/MockImageProvider';

import { RunwayProvider } from './video/RunwayProvider';
import { MockVideoProvider } from './video/MockVideoProvider';

import { ElevenLabsProvider } from './voice/ElevenLabsProvider';
import { OpenAITTSProvider } from './voice/OpenAITTSProvider';
import { WhisperProvider } from './voice/WhisperProvider';
import { MockVoiceProvider } from './voice/MockVoiceProvider';

import { env } from '../config/env';
import { logger } from '../config/logger';

interface FallbackChain {
  text: string[];
  image: string[];
  video: string[];
  voice: string[];
}

/**
 * ProviderFactory — central registry for all AI providers.
 * Providers are lazily instantiated, cached as singletons,
 * and automatically fall back to the next available option.
 */
class ProviderFactory {
  private textProviders = new Map<string, ITextProvider>();
  private imageProviders = new Map<string, IImageProvider>();
  private videoProviders = new Map<string, IVideoProvider>();
  private voiceProviders = new Map<string, IVoiceProvider>();
  private whisperProvider: WhisperProvider | null = null;

  /** Ordered fallback chains */
  private fallbacks: FallbackChain = {
    text: ['groq', 'openai', 'anthropic', 'deepseek', 'gemini', 'mock'],
    image: ['dalle', 'stability', 'mock'],
    video: ['runway', 'mock'],
    voice: ['elevenlabs', 'openai-tts', 'mock'],
  };

  // =========================================================
  // TEXT PROVIDERS
  // =========================================================
  getTextProvider(name?: string): ITextProvider {
    const preferred = name ?? env.DEFAULT_TEXT_PROVIDER;
    const chain = [preferred, ...this.fallbacks.text.filter(n => n !== preferred)];

    for (const providerName of chain) {
      try {
        if (this.textProviders.has(providerName)) return this.textProviders.get(providerName)!;

        const provider = this.instantiateTextProvider(providerName);
        if (provider.isAvailable()) {
          this.textProviders.set(providerName, provider);
          logger.info(`[ProviderFactory] Text provider ready: ${provider.providerName}`);
          return provider;
        }
      } catch (err) {
        logger.warn(`[ProviderFactory] Text provider "${providerName}" unavailable: ${(err as Error).message}`);
      }
    }

    // Final fallback: always works
    const mock = new MockTextProvider();
    this.textProviders.set('mock', mock);
    return mock;
  }

  private instantiateTextProvider(name: string): ITextProvider {
    switch (name) {
      case 'groq': return new GroqProvider();
      case 'openai': return new OpenAITextProvider();
      case 'anthropic': return new AnthropicProvider();
      case 'deepseek': return new DeepSeekProvider();
      case 'gemini': return new GeminiProvider();
      case 'mock': return new MockTextProvider();
      default: return new MockTextProvider();
    }
  }

  // =========================================================
  // IMAGE PROVIDERS
  // =========================================================
  getImageProvider(name?: string): IImageProvider {
    const preferred = name ?? env.DEFAULT_IMAGE_PROVIDER;
    const chain = [preferred, ...this.fallbacks.image.filter(n => n !== preferred)];

    for (const providerName of chain) {
      try {
        if (this.imageProviders.has(providerName)) return this.imageProviders.get(providerName)!;

        const provider = this.instantiateImageProvider(providerName);
        if (provider.isAvailable()) {
          this.imageProviders.set(providerName, provider);
          logger.info(`[ProviderFactory] Image provider ready: ${provider.providerName}`);
          return provider;
        }
      } catch (err) {
        logger.warn(`[ProviderFactory] Image provider "${providerName}" unavailable: ${(err as Error).message}`);
      }
    }

    const mock = new MockImageProvider();
    this.imageProviders.set('mock', mock);
    return mock;
  }

  private instantiateImageProvider(name: string): IImageProvider {
    switch (name) {
      case 'dalle': return new DallE3Provider();
      case 'stability': return new StabilityAIProvider();
      case 'mock': return new MockImageProvider();
      default: return new MockImageProvider();
    }
  }

  // =========================================================
  // VIDEO PROVIDERS
  // =========================================================
  getVideoProvider(name?: string): IVideoProvider {
    const preferred = name ?? env.DEFAULT_VIDEO_PROVIDER;
    const chain = [preferred, ...this.fallbacks.video.filter(n => n !== preferred)];

    for (const providerName of chain) {
      try {
        if (this.videoProviders.has(providerName)) return this.videoProviders.get(providerName)!;

        const provider = this.instantiateVideoProvider(providerName);
        if (provider.isAvailable()) {
          this.videoProviders.set(providerName, provider);
          logger.info(`[ProviderFactory] Video provider ready: ${provider.providerName}`);
          return provider;
        }
      } catch (err) {
        logger.warn(`[ProviderFactory] Video provider "${providerName}" unavailable: ${(err as Error).message}`);
      }
    }

    const mock = new MockVideoProvider();
    this.videoProviders.set('mock', mock);
    return mock;
  }

  private instantiateVideoProvider(name: string): IVideoProvider {
    switch (name) {
      case 'runway': return new RunwayProvider();
      case 'mock': return new MockVideoProvider();
      default: return new MockVideoProvider();
    }
  }

  // =========================================================
  // VOICE PROVIDERS
  // =========================================================
  getVoiceProvider(name?: string): IVoiceProvider {
    const preferred = name ?? env.DEFAULT_VOICE_PROVIDER;
    const chain = [preferred, ...this.fallbacks.voice.filter(n => n !== preferred)];

    for (const providerName of chain) {
      try {
        if (this.voiceProviders.has(providerName)) return this.voiceProviders.get(providerName)!;

        const provider = this.instantiateVoiceProvider(providerName);
        if (provider.isAvailable()) {
          this.voiceProviders.set(providerName, provider);
          logger.info(`[ProviderFactory] Voice provider ready: ${provider.providerName}`);
          return provider;
        }
      } catch (err) {
        logger.warn(`[ProviderFactory] Voice provider "${providerName}" unavailable: ${(err as Error).message}`);
      }
    }

    const mock = new MockVoiceProvider();
    this.voiceProviders.set('mock', mock);
    return mock;
  }

  getWhisperProvider(): WhisperProvider {
    if (!this.whisperProvider) {
      this.whisperProvider = new WhisperProvider();
    }
    return this.whisperProvider;
  }

  private instantiateVoiceProvider(name: string): IVoiceProvider {
    switch (name) {
      case 'elevenlabs': return new ElevenLabsProvider();
      case 'openai-tts': return new OpenAITTSProvider();
      case 'mock': return new MockVoiceProvider();
      default: return new MockVoiceProvider();
    }
  }

  // =========================================================
  // HEALTH CHECK
  // =========================================================
  getAvailableProviders() {
    return {
      text: (['groq', 'openai', 'anthropic', 'deepseek', 'gemini', 'mock'] as const).filter((name) => {
        try { return this.instantiateTextProvider(name).isAvailable(); } catch { return false; }
      }),
      image: (['dalle', 'stability', 'mock'] as const).filter((name) => {
        try { return this.instantiateImageProvider(name).isAvailable(); } catch { return false; }
      }),
      video: (['runway', 'mock'] as const).filter((name) => {
        try { return this.instantiateVideoProvider(name).isAvailable(); } catch { return false; }
      }),
      voice: (['elevenlabs', 'openai-tts', 'mock'] as const).filter((name) => {
        try { return this.instantiateVoiceProvider(name).isAvailable(); } catch { return false; }
      }),
    };
  }

  /** Clear cached instances (useful for testing) */
  clearCache() {
    this.textProviders.clear();
    this.imageProviders.clear();
    this.videoProviders.clear();
    this.voiceProviders.clear();
    this.whisperProvider = null;
  }
}

export const providerFactory = new ProviderFactory();

