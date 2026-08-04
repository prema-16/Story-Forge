/**
 * Phase 6 — Production Hardening Integration Test Suite
 * Tests all 12 modules: Infrastructure, Observability, Security,
 * Compliance, Performance, Chaos, AI Quality, Learning, Cost
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

// Module 1/2: Infrastructure & Global Deployment
import { GlobalDeploymentManager, globalDeploymentManager } from '../infrastructure/GlobalDeploymentManager';
import { RegionFailoverService, regionFailoverService } from '../infrastructure/RegionFailoverService';
import { HealthScoreEngine, healthScoreEngine } from '../infrastructure/HealthScoreEngine';
import { PredictiveScalingService } from '../infrastructure/PredictiveScalingService';
import { DisasterRecoveryService, disasterRecoveryService } from '../infrastructure/DisasterRecoveryService';
import { PublicStatusPageService, publicStatusPageService } from '../infrastructure/PublicStatusPageService';

// Module 4: Observability
import { MetricsCollector, metricsCollector } from '../observability/MetricsCollector';
import { TracingService, tracingService } from '../observability/TracingService';
import { AlertManager, alertManager } from '../observability/AlertManager';

// Module 5: Security
import { OWASPChecklist, owaspChecklist } from '../security/OWASPChecklist';
import { SBOMGenerator, sbomGenerator } from '../security/SBOMGenerator';
import { AnomalyDetector, anomalyDetector } from '../security/AnomalyDetector';

// Module 6: Compliance
import { GDPRService, gdprService } from '../compliance/GDPRService';
import { ComplianceReportGenerator, complianceReportGenerator } from '../compliance/ComplianceReportGenerator';

// Module 7: Performance
import { DatabaseOptimizer, databaseOptimizer } from '../performance/DatabaseOptimizer';
import { PerformanceBenchmark, performanceBenchmark } from '../performance/PerformanceBenchmark';

// Module 8: Chaos
import { ChaosOrchestrator, chaosOrchestrator } from '../chaos/ChaosOrchestrator';

// Module 9: AI Evaluation
import { PromptEvaluator, promptEvaluator } from '../evaluation/PromptEvaluator';
import { GoldenDatasetManager, goldenDatasetManager } from '../evaluation/GoldenDatasetManager';

// Module 10: Learning
import { FeedbackIngestionService, feedbackIngestionService } from '../learning/FeedbackIngestionService';

// Module 11: Cost
import { ProviderCostRouter, providerCostRouter } from '../cost/ProviderCostRouter';
import { CostForecastingService, costForecastingService } from '../cost/CostForecastingService';

// ────────────────────────────────────────────────────────────
// Module 1/2: Global Deployment & Region Failover
// ────────────────────────────────────────────────────────────
describe('Module 1/2 — Global Deployment & Region Failover', () => {
  it('should return 6 configured regions', () => {
    const regions = globalDeploymentManager.getAllRegions();
    expect(regions).toHaveLength(6);
  });

  it('should identify exactly one primary region', () => {
    const primary = globalDeploymentManager.getPrimaryRegion();
    expect(primary).toBeDefined();
    expect(primary.primary).toBe(true);
    expect(primary.id).toBe('us-east-1');
  });

  it('should route traffic to lowest latency healthy region', () => {
    const decision = globalDeploymentManager.routeTrafficByLatency();
    expect(decision.region).toBeDefined();
    expect(decision.latencyMs).toBeLessThan(50);
  });

  it('should perform failover and exclude unhealthy region', async () => {
    const event = await regionFailoverService.performFailover('us-east-1', 'test');
    expect(event.fromRegion).toBe('us-east-1');
    expect(event.toRegion).not.toBe('us-east-1');
    expect(event.rtoSeconds).toBeLessThan(900);
    await regionFailoverService.restoreRegion('us-east-1');
  });

  it('should generate complete region topology', () => {
    const topology = globalDeploymentManager.getRegionTopology() as { totalRegions: number };
    expect(topology.totalRegions).toBe(6);
  });
});

// ────────────────────────────────────────────────────────────
// Infrastructure Services
// ────────────────────────────────────────────────────────────
describe('Infrastructure — Health Score & Predictive Scaling', () => {
  it('should compute health score from component array', () => {
    const report = healthScoreEngine.generateSampleReport();
    expect(report.overallScore).toBeGreaterThan(80);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(report.grade);
    expect(report.components.length).toBeGreaterThan(0);
  });

  it('should forecast scaling needs from load history', () => {
    const svc = new PredictiveScalingService();
    for (let i = 0; i < 60; i++) svc.recordLoad(500 + i * 5);
    const forecast = svc.generateForecast();
    expect(forecast.recommendedPodCount).toBeGreaterThanOrEqual(2);
    expect(forecast.confidence).toBeGreaterThan(50);
    expect(['up', 'down', 'stable']).toContain(forecast.scaleDirection);
  });

  it('should trigger and verify backup record', async () => {
    const backup = await disasterRecoveryService.triggerBackup('full', 'us-east-1');
    expect(backup.type).toBe('full');
    expect(backup.verified).toBe(true);
    expect(backup.sizeGb).toBeGreaterThan(0);
  });

  it('should simulate restore within RTO target', async () => {
    await disasterRecoveryService.triggerBackup('incremental');
    const result = await disasterRecoveryService.simulateRestore('us-west-2');
    expect(result.success).toBe(true);
    expect(result.rtoActualSeconds).toBeLessThan(900);
    expect(result.rpoActualMinutes).toBeLessThan(5);
  });

  it('should create and resolve an incident', () => {
    const incident = publicStatusPageService.createIncident('Test Incident', ['API Gateway']);
    expect(incident.status).toBe('investigating');
    const resolved = publicStatusPageService.resolveIncident(incident.id);
    expect(resolved).toBe(true);
    const status = publicStatusPageService.getStatusPage();
    expect(status.overallStatus).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────
// Module 4: Observability
// ────────────────────────────────────────────────────────────
describe('Module 4 — Observability', () => {
  it('should record metrics and compute latency buckets', () => {
    const mc = new MetricsCollector();
    mc.recordLatency('/api/aios/generate', 95);
    mc.recordLatency('/api/aios/generate', 180);
    mc.recordLatency('/api/aios/generate', 320);
    const buckets = mc.getLatencyBuckets();
    expect(buckets[0].p50Ms).toBeGreaterThan(0);
    expect(buckets[0].p95Ms).toBeGreaterThanOrEqual(buckets[0].p50Ms);
  });

  it('should produce Prometheus text output', () => {
    metricsCollector.record('test_metric', 42, 'gauge', { env: 'test' });
    const output = metricsCollector.getPrometheusOutput();
    expect(output).toContain('# TYPE');
  });

  it('should start and finish a trace span', () => {
    const span = tracingService.startSpan('test-op', 'backend-test');
    tracingService.setTag(span.spanId, 'test', true);
    const finished = tracingService.finishSpan(span.spanId);
    expect(finished).toBeDefined();
    expect(finished!.durationMs).toBeGreaterThanOrEqual(0);
    expect(finished!.status).toBe('ok');
  });

  it('should fire alert when threshold exceeded', () => {
    const am = new AlertManager();
    const fired = am.evaluateMetric('api_p95_latency_ms', 350);
    expect(fired.length).toBeGreaterThan(0);
    expect(fired[0].severity).toBe('critical');
    expect(fired[0].state).toBe('firing');
  });

  it('should resolve alert when value drops below threshold', () => {
    const am = new AlertManager();
    am.evaluateMetric('api_p95_latency_ms', 350);
    am.evaluateMetric('api_p95_latency_ms', 150);
    expect(am.getActiveAlerts()).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────────
// Module 5: Security
// ────────────────────────────────────────────────────────────
describe('Module 5 — Security Hardening', () => {
  it('should report high OWASP compliance score', () => {
    const report = owaspChecklist.getReport();
    expect(report.passPct).toBeGreaterThanOrEqual(85);
    expect(report.fail).toBe(0);
  });

  it('should generate valid CycloneDX SBOM', () => {
    const sbom = sbomGenerator.generate();
    expect(sbom.bomFormat).toBe('CycloneDX');
    expect(sbom.specVersion).toBe('1.5');
    expect(sbom.components.length).toBeGreaterThan(10);
    const licenses = sbomGenerator.getLicenseSummary();
    expect(licenses['MIT']).toBeGreaterThan(0);
  });

  it('should detect security scanner in user agent', () => {
    const anomaly = anomalyDetector.recordRequest('1.2.3.4', 'sqlmap/1.7');
    expect(anomaly).not.toBeNull();
    expect(anomaly!.type).toBe('scanner_detected');
    expect(anomaly!.blocked).toBe(true);
  });

  it('should block subsequent requests from blocked IP', () => {
    const anomaly = anomalyDetector.recordRequest('1.2.3.4', 'Mozilla/5.0');
    expect(anomaly).not.toBeNull();
    expect(anomaly!.blocked).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Module 6: Compliance
// ────────────────────────────────────────────────────────────
describe('Module 6 — Compliance', () => {
  it('should submit and process erasure request', async () => {
    const req = gdprService.submitRequest('user_001', 'test@example.com', 'erasure');
    expect(req.status).toBe('pending');
    const result = await gdprService.processErasureRequest(req.id);
    expect(result).toBe(true);
    const requests = gdprService.getRequests('user_001');
    expect(requests[0].status).toBe('completed');
  });

  it('should generate GDPR compliance report', () => {
    const report = complianceReportGenerator.generateReport('GDPR');
    expect(report.compliancePct).toBeGreaterThan(80);
    expect(report.controls).toBeDefined();
  });

  it('should generate SOC2 compliance report at 100%', () => {
    const report = complianceReportGenerator.generateReport('SOC2');
    expect(report.compliancePct).toBe(100);
  });

  it('should record and withdraw consent', () => {
    const rec = complianceReportGenerator.recordConsent('user_001', 'marketing', true);
    expect(rec.granted).toBe(true);
    const withdrawn = complianceReportGenerator.withdrawConsent('user_001', 'marketing');
    expect(withdrawn).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Module 7: Performance
// ────────────────────────────────────────────────────────────
describe('Module 7 — Performance Engineering', () => {
  it('should return index recommendations for StoryForge collections', () => {
    const recs = databaseOptimizer.getRecommendations();
    expect(recs.length).toBeGreaterThan(3);
    expect(recs.every((r) => r.estimatedImprovementPct > 0)).toBe(true);
  });

  it('should detect slow queries', () => {
    databaseOptimizer.recordQuery('{ "userId": "123" }', 'projects', 250, false);
    const slow = databaseOptimizer.getSlowQueries(100);
    expect(slow.length).toBeGreaterThan(0);
  });

  it('should generate index DDL statements', () => {
    const ddl = databaseOptimizer.generateIndexDDL();
    expect(ddl.length).toBeGreaterThan(0);
    expect(ddl[0]).toContain('createIndex');
  });

  it('should track p95 latency and verify SLA compliance', () => {
    const pb = new PerformanceBenchmark();
    for (let i = 0; i < 200; i++) pb.record('/api/aios/generate', 'POST', 200, 50 + Math.random() * 100);
    const sla = pb.getSLACompliance();
    expect(sla.p95TargetMs).toBe(200);
    expect(sla.p95Passing).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Module 8: Chaos Engineering
// ────────────────────────────────────────────────────────────
describe('Module 8 — Chaos Engineering', () => {
  it('should run worker_kill experiment within RTO', async () => {
    const exp = chaosOrchestrator.scheduleExperiment('Worker Kill Test', 'storyforge-worker', 'worker_kill', 30);
    const result = await chaosOrchestrator.runExperiment(exp.id);
    expect(result.rtoBreached).toBe(false);
    expect(result.recoveryTimeSeconds).toBeLessThan(900);
    expect(result.dataLoss).toBe(false);
  });

  it('should run redis_outage experiment within RTO', async () => {
    const exp = chaosOrchestrator.scheduleExperiment('Redis Outage Test', 'storyforge-redis', 'redis_outage', 20);
    const result = await chaosOrchestrator.runExperiment(exp.id);
    expect(result.recoveryTimeSeconds).toBeLessThan(60);
  });

  it('should generate chaos report with pass/fail summary', () => {
    const report = chaosOrchestrator.getChaosReport() as { failedBenchmarks: number };
    expect(report.failedBenchmarks).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────
// Module 9: AI Quality Platform
// ────────────────────────────────────────────────────────────
describe('Module 9 — AI Quality Platform', () => {
  it('should evaluate prompt and return multi-dimension scores', () => {
    const result = promptEvaluator.evaluate(
      'eval_001',
      'Create a compelling 60-second intro for a documentary about quantum computing',
      'Quantum computing represents the next frontier of technology, where subatomic particles...'
    );
    expect(result.scores.overall).toBeGreaterThan(60);
    expect(result.scores.safety).toBeGreaterThan(90);
    expect(result.evaluatedAt).toBeDefined();
  });

  it('should score video quality from resolution and bitrate', () => {
    const score = promptEvaluator.scoreVideoQuality('vid_001', 1920, 8000);
    expect(score.resolutionScore).toBeGreaterThan(80);
    expect(score.overallScore).toBeGreaterThan(70);
  });

  it('should predict thumbnail CTR', () => {
    const score = promptEvaluator.scoreThumbnail('https://cdn.storyforge.ai/thumb_001.jpg');
    expect(score.ctrPrediction).toBeGreaterThan(0);
    expect(score.overallScore).toBeGreaterThan(50);
  });

  it('should score SEO for well-formed metadata', () => {
    const score = promptEvaluator.scoreSEO(
      'Why Quantum Computing Will Change Everything in 2026',
      'Discover how quantum computing is revolutionizing technology, finance, and medicine. This in-depth guide explains the key breakthroughs.',
      ['quantum computing', 'technology', 'innovation', 'future', 'AI']
    );
    expect(score.overallScore).toBeGreaterThan(70);
    expect(score.keywordDensity).toBeGreaterThan(0);
  });

  it('should detect hallucination in unsupported claims', () => {
    const result = promptEvaluator.detectHallucination(
      'The video contains footage from Mars',
      ['The video covers quantum computing research', 'Topics include superposition and entanglement']
    );
    expect(result.hallucinated).toBe(true);
    expect(result.unmatchedClaims.length).toBeGreaterThan(0);
  });

  it('should pass golden regression tests', () => {
    const testCases = goldenDatasetManager.getTestCases();
    expect(testCases.length).toBeGreaterThanOrEqual(3);

    const result = goldenDatasetManager.runRegressionTest(testCases[0].id, 'quantum computing is the future', 88);
    expect(result.passed).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// Module 10: Continuous Learning
// ────────────────────────────────────────────────────────────
describe('Module 10 — Continuous Learning', () => {
  it('should ingest thumbs_up feedback', () => {
    const fb = feedbackIngestionService.ingestFeedback('user_001', 'thumbs_up', { projectId: 'proj_001' }, undefined, undefined, 'proj_001');
    expect(fb.type).toBe('thumbs_up');
  });

  it('should create A/B experiment with 50/50 split', () => {
    const exp = feedbackIngestionService.createABExperiment('Prompt Style Test', ['detailed', 'concise'], [50, 50]);
    expect(exp.active).toBe(true);
    expect(exp.variants).toHaveLength(2);
  });

  it('should deterministically assign variant by userId', () => {
    const exp = feedbackIngestionService.createABExperiment('Font Test', ['A', 'B'], [50, 50]);
    const v1 = feedbackIngestionService.assignVariant(exp.id, 'user_abc');
    const v2 = feedbackIngestionService.assignVariant(exp.id, 'user_abc');
    expect(v1).toBe(v2); // same user always gets same variant
  });

  it('should conclude experiment and set winner', () => {
    const exp = feedbackIngestionService.createABExperiment('CTA Test', ['red', 'green'], [50, 50]);
    const concluded = feedbackIngestionService.concludeExperiment(exp.id, 'green');
    expect(concluded!.winner).toBe('green');
    expect(concluded!.active).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// Module 11: Cost Optimization
// ────────────────────────────────────────────────────────────
describe('Module 11 — Cost Optimization', () => {
  it('should route to cheapest provider for given tokens', () => {
    const decision = providerCostRouter.routeByCost(500, 1000, 80);
    expect(decision.provider).toBeDefined();
    expect(decision.estimatedCostUSD).toBeGreaterThan(0);
    expect(['gemini', 'gpt4', 'claude', 'mistral']).toContain(decision.provider);
  });

  it('should route by latency within SLA', () => {
    const decision = providerCostRouter.routeByLatency(2000, 80);
    expect(decision.estimatedLatencyMs).toBeLessThanOrEqual(2000);
  });

  it('should mark provider unavailable and reroute', () => {
    const r = new ProviderCostRouter();
    r.markProviderUnavailable('gpt4');
    const decision = r.routeByCost(500, 1000, 80);
    expect(decision.provider).not.toBe('gpt4');
  });

  it('should generate monthly cost forecast', () => {
    const forecast = costForecastingService.generateMonthlyForecast(10000, 1000);
    expect(forecast.totalCostUSD).toBeGreaterThan(0);
    expect(forecast.savingsFromOptimizationUSD).toBeGreaterThan(0);
    expect(forecast.month).toBeDefined();
  });

  it('should optimize storage tiers for old assets', () => {
    const svc = new CostForecastingService();
    svc.registerAsset('old-render.mp4', 5 * 1024 * 1024 * 1024);
    const result = svc.optimizeStorageTiers();
    expect(typeof result.movedAssets).toBe('number');
  });
});
