# StoryForge AI V3 — Standard Operating Procedures (SOP)

Operational runbook for site reliability engineers and platform administrators.

## 1. System Health Monitoring
- Operations Dashboard: `http://localhost:3000/ops`
- Public Status Page: `/api/platform/status`
- Prometheus Metrics: `/api/platform/observability/metrics/prometheus`

## 2. Emergency Incident Escalation
- **Level 1 (P3)**: Warning alerts (p99 > 500ms) → Slack notification
- **Level 2 (P2)**: Degraded region / queue depth > 1000 → Trigger auto-scaling / regional traffic shift
- **Level 3 (P1)**: Region outage / p95 > 200ms breach → Initiate automated region failover via `POST /api/platform/infrastructure/failover`

## 3. Disaster Recovery Procedures
- Full backup trigger: `POST /api/platform/infrastructure/disaster-recovery/backup`
- Restore simulation check: `POST /api/platform/infrastructure/disaster-recovery/simulate-restore`
- RTO target: < 15 min | RPO target: < 5 min
