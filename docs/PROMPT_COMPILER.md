# AIOS Prompt Compiler Documentation

## Pipeline Stages
1. Raw Prompt & Variable Interpolation (`{{variable}}`)
2. Memory Graph Retrieval
3. Brand Rules Injection
4. Safety & Content Policy Injection
5. Provider Adapter Formatting (OpenAI / Claude / Gemini)
6. Prompt Optimizer & Whitespace Trimming
7. Token Budget Estimation
8. Final Compilation
