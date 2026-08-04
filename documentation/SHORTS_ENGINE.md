# AI Shorts Engine Architecture

The AI Shorts Engine (`ShortsEngineService.ts`) handles scene timing, narration, visual prompt generation, camera movements, and audio triggers tailored specifically for vertical 9:16 aspect ratios.

## Story Structure Pipeline

```
[Input Content]
       │
       ▼
 [Hook Agent] ────► 10+ Hook Variations (Curiosity, Shock, Fear, Tech, etc.)
       │
       ▼
 [Story Engine] ──► Hook → Problem → Curiosity → Build-up → Reveal → Conclusion → CTA
       │
       ▼
 [B-Roll Engine] ─► Stock + AI Generated + Infographics + Charts + Maps
       │
       ▼
 [Pacing Model] ──► 15s (2.5s cuts) | 30s (3.5s cuts) | 60s/90s (4.5s cuts)
```
