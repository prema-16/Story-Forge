# AIOS System Architecture & Component Mapping

## Architecture Overview

StoryForge AIOS is decoupled into 14 distinct system layers:

1. **Provider Layer** (`src/aios/providers/`): Abstracts OpenAI, Anthropic, Gemini, Groq, DeepSeek, ElevenLabs, Stability AI, Runway.
2. **Agent Layer** (`src/aios/agents/`): 19 specialized agents with standard lifecycle methods.
3. **Workflow Layer** (`src/aios/workflow/`): DAG execution engine supporting parallel branches.
4. **Memory Layer** (`src/aios/memory/`): Brand, tone, and prompt history semantic storage.
5. **Prompt Layer** (`src/aios/prompts/`): 8-stage industrial prompt compiler.
6. **Context Layer** (`src/aios/context/`): Context window optimization and token budget aggregation.
7. **Queue Layer** (`src/aios/queues/`): BullMQ queue orchestration.
8. **Streaming Layer** (`src/aios/streaming/`): SSE real-time telemetry.
9. **Cost Layer** (`src/aios/cost/`): Dollar and token usage tracking.
10. **Evaluation Layer** (`src/aios/evaluation/`): Automated quality scoring.
11. **Plugin Layer** (`src/aios/plugins/`): Plugin manifest registration.
12. **SDK Layer** (`src/aios/sdk/`): TypeScript developer SDK.
13. **Observability Layer** (`src/aios/observability/`): OpenTelemetry metrics.
14. **Extras Layer** (`src/aios/extras/`): AI Benchmark, Smart Cache, AI Sandbox.
