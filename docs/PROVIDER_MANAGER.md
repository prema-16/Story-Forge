# AIOS Provider Manager Documentation

## Overview
The Provider Manager decouples AI provider APIs from application logic using an extensible plugin architecture.

## Supported Providers
- **Text**: OpenAI (GPT-4o), Anthropic Claude (3.5 Sonnet), Google Gemini (1.5 Pro), Groq (Llama 3.3 70B), DeepSeek (V3/R1), OpenRouter.
- **Voice**: ElevenLabs, Whisper, OpenAI TTS, Google TTS.
- **Image**: Stability AI (SDXL / Ultra), DALL-E 3, Ideogram.
- **Video**: Runway Gen-3 Alpha, Kling, Pika.

## Features
- **Circuit Breaker**: Closed, Open (30s cooldown), and Half-Open recovery.
- **Health Tracker**: Average latency tracking, token count, cost calculation, quality score.
- **Provider Router**: Strategy-based routing (`quality`, `cost`, `latency`, `weighted`) with automatic failover cascades.
