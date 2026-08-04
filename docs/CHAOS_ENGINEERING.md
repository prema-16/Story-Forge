# Chaos Engineering Framework Guide

StoryForge AI V3 uses automated failure simulation to guarantee system resilience.

## Experiment Types
1. **Worker Kill**: Simulates SIGKILL on rendering workers (Recovery target < 60s)
2. **Redis Outage**: Simulates cache/pubsub interruption (Recovery target < 15s)
3. **Database Failover**: Simulates MongoDB primary step-down (Recovery target < 60s)
4. **AI Provider Outage**: Simulates HTTP 503 from primary LLM provider (Sub-25ms failover)
5. **Network Latency**: Simulates regional packet delay injection

## Execution
Run experiments via `POST /api/platform/chaos/run`.
