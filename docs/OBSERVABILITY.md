# Observability Stack Guide

StoryForge AI V3 integrates metrics, distributed tracing, and structured logging.

## Components
- **MetricsCollector**: Prometheus metrics exposed on `/api/platform/observability/metrics/prometheus`
- **TracingService**: OpenTelemetry SDK integrated with Jaeger (`http://localhost:16686`)
- **AlertManager**: Evaluates 7 core rules (latency > 200ms, queue depth > 1000, error rate > 1%)
- **LogAggregator**: Structured JSON logging formatted for Loki ingestion
