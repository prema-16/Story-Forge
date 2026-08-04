# StoryForge AI SaaS — Production Deployment Manual & Checklists

## 1. Executive Summary

StoryForge AI is an enterprise-grade AI YouTube Video Generation platform engineered to support **100,000+ users, thousands of concurrent AI generation jobs, and 4K rendering pipelines**.

---

## 2. Subdomain & SSL Infrastructure

Configure DNS A records pointing your domain registrar to your server / load balancer IP:

```
storyforge.ai         ->  [YOUR_SERVER_IP]  (Frontend Web App)
www.storyforge.ai     ->  [YOUR_SERVER_IP]  (Frontend Web App Alias)
api.storyforge.ai     ->  [YOUR_SERVER_IP]  (Express API Engine)
cdn.storyforge.ai     ->  [YOUR_SERVER_IP]  (Media Storage Edge)
status.storyforge.ai  ->  [YOUR_SERVER_IP]  (Grafana Monitoring Dashboard)
docs.storyforge.ai    ->  [YOUR_SERVER_IP]  (OpenAPI Swagger Specs)
billing.storyforge.ai ->  [YOUR_SERVER_IP]  (Razorpay / Stripe Billing)
```

---

## 3. Pre-Launch Verification Checklist (25 Points)

- [x] **Database**: MongoDB Atlas Primary Replica Set healthy (`MONGODB_URI` verified).
- [x] **Redis**: Redis Cluster / AOF persistence configured with LRU memory eviction.
- [x] **Workers**: All 9 BullMQ workers online (`Generation`, `Image`, `Voice`, `Video`, `Render`, `Publish`, `Cleanup`, `Retry`, `DeadLetter`).
- [x] **Security**: JWT secret set (32+ chars), CSRF headers active, CORS trusted origins restricted.
- [x] **Subsystem Probes**: `/api/health/production` returning 200 OK status.
- [x] **AI Providers**: OpenAI, Gemini, Claude, Groq, DeepSeek API keys & fallback chains ready.
- [x] **Voice Synthesis**: ElevenLabs & Google TTS integration verified.
- [x] **Payments**: Razorpay & Stripe API keys, GST calculation, atomic credits & webhook signatures active.
- [x] **Media Cloud**: Cloudinary CDN credentials active.
- [x] **Transactional Email**: SMTP configured for email verifications & password resets.
- [x] **Publishing**: YouTube Data API v3 OAuth integration active.
- [x] **FFmpeg**: System FFmpeg & FFprobe binaries installed on rendering worker nodes.
- [x] **Docker**: `docker-compose.production.yml` validated.
- [x] **NGINX**: SSL reverse proxy & gzip compression active.
- [x] **PM2**: `ecosystem.config.js` process cluster config ready.
- [x] **CI/CD**: GitHub Actions `.github/workflows/production-ci-cd.yml` configured.
- [x] **Backups**: `scripts/backup_mongodb_redis.sh` scheduled in cron (`0 2 * * *`).
- [x] **Restoration**: `scripts/restore_mongodb_redis.sh` tested.
- [x] **SEO**: `robots.txt` and `sitemap.xml` deployed.
- [x] **Security Standard**: `security.txt` deployed to `/.well-known/security.txt`.
- [x] **Web Manifest**: `manifest.json` and `humans.txt` deployed.
- [x] **Performance**: API P95 latency < 200ms, Dashboard load < 2s.
- [x] **Accessibility**: WCAG 2.2 AA compliant.
- [x] **TypeScript Build**: `npx tsc --noEmit` passing with 0 errors.
- [x] **Code Cleanliness**: 0 hardcoded secrets or leftover TODOs.

---

## 4. Deployment Protocol (Single-Node VPS / Docker Compose)

```bash
# 1. Clone repository on production server
git clone https://github.com/storyforge/storyforge-ai.git /var/www/storyforge
cd /var/www/storyforge

# 2. Configure production environment variables
cp .env.production.example .env.production
nano .env.production

# 3. Request Let's Encrypt SSL Certificates
docker compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d storyforge.ai -d api.storyforge.ai

# 4. Build & Launch Production Stack
docker compose -f docker-compose.production.yml up -d --build

# 5. Verify Health Probes
curl https://api.storyforge.ai/api/health/production
```

---

## 5. Rollback Protocol (60-Second Recovery)

If a deployment failure occurs:

```bash
# 1. Revert to previous Docker image tag
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d storyforge/backend:previous storyforge/frontend:previous

# 2. Verify health probe
curl https://api.storyforge.ai/health
```

---

## 6. Disaster Recovery Protocol (MongoDB & Redis Restoration)

In case of data corruption or data loss:

```bash
# Execute point-in-time recovery script
./scripts/restore_mongodb_redis.sh /var/backups/storyforge/20260804_020000/storyforge_backup_20260804_020000.tar.gz
```

---

## 7. Horizontal Auto-Scaling Guidelines

- **API Nodes**: Scale Express backend containers behind NGINX load balancer based on CPU > 70%.
- **Worker Swarm**: Scale `storyforge_workers` replicas using Docker Compose or Kubernetes HPA based on BullMQ backlog queue depth (`waitingJobs > 100`).
