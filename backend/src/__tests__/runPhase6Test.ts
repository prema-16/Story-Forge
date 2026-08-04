#!/usr/bin/env ts-node
/**
 * Phase 6 — Production Hardening Integration Verification Runner
 * Runs all Phase 6 module verifications and prints a summary report.
 * Usage: npx ts-node src/__tests__/runPhase6Test.ts
 */

import { globalDeploymentManager } from '../infrastructure/GlobalDeploymentManager';
import { regionFailoverService } from '../infrastructure/RegionFailoverService';
import { healthScoreEngine } from '../infrastructure/HealthScoreEngine';
import { PredictiveScalingService } from '../infrastructure/PredictiveScalingService';
import { disasterRecoveryService } from '../infrastructure/DisasterRecoveryService';
import { publicStatusPageService } from '../infrastructure/PublicStatusPageService';
import { MetricsCollector } from '../observability/MetricsCollector';
import { tracingService } from '../observability/TracingService';
import { AlertManager } from '../observability/AlertManager';
import { owaspChecklist } from '../security/OWASPChecklist';
import { sbomGenerator } from '../security/SBOMGenerator';
import { AnomalyDetector } from '../security/AnomalyDetector';
import { gdprService } from '../compliance/GDPRService';
import { complianceReportGenerator } from '../compliance/ComplianceReportGenerator';
import { databaseOptimizer } from '../performance/DatabaseOptimizer';
import { PerformanceBenchmark } from '../performance/PerformanceBenchmark';
import { chaosOrchestrator } from '../chaos/ChaosOrchestrator';
import { promptEvaluator } from '../evaluation/PromptEvaluator';
import { goldenDatasetManager } from '../evaluation/GoldenDatasetManager';
import { feedbackIngestionService } from '../learning/FeedbackIngestionService';
import { providerCostRouter } from '../cost/ProviderCostRouter';
import { CostForecastingService } from '../cost/CostForecastingService';

interface TestResult {
  module: string;
  name: string;
  passed: boolean;
  detail?: string;
  error?: string;
}

const results: TestResult[] = [];

async function test(module: string, name: string, fn: () => Promise<boolean> | boolean): Promise<void> {
  try {
    const passed = await fn();
    results.push({ module, name, passed, detail: passed ? '✅' : '❌ Assertion failed' });
  } catch (err: any) {
    results.push({ module, name, passed: false, error: err.message });
  }
}

async function runAllTests(): Promise<void> {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  StoryForge AI V3 — Phase 6 Production Hardening');
  console.log('  Integration Verification Suite');
  console.log('══════════════════════════════════════════════════════\n');

  // Module 1/2: Infrastructure
  await test('M1/2 Infrastructure', '6 regions configured', () => globalDeploymentManager.getAllRegions().length === 6);
  await test('M1/2 Infrastructure', 'Primary region is us-east-1', () => globalDeploymentManager.getPrimaryRegion().id === 'us-east-1');
  await test('M1/2 Infrastructure', 'Traffic routed to lowest-latency region', () => {
    const d = globalDeploymentManager.routeTrafficByLatency();
    return d.latencyMs < 50;
  });
  await test('M1/2 Infrastructure', 'Region failover completes within RTO', async () => {
    const e = await regionFailoverService.performFailover('ap-southeast-2', 'test');
    await regionFailoverService.restoreRegion('ap-southeast-2');
    return e.rtoSeconds < 900;
  });
  await test('M1/2 Infrastructure', 'Health score produces grade A', () => healthScoreEngine.generateSampleReport().grade === 'A');
  await test('M1/2 Infrastructure', 'Predictive scaling generates forecast', () => {
    const svc = new PredictiveScalingService();
    for (let i = 0; i < 30; i++) svc.recordLoad(400 + i * 10);
    const f = svc.generateForecast();
    return f.recommendedPodCount >= 2 && f.recommendedPodCount <= 50;
  });
  await test('M1/2 Infrastructure', 'Backup created and verified', async () => {
    const b = await disasterRecoveryService.triggerBackup('incremental');
    return b.verified && b.sizeGb > 0;
  });
  await test('M1/2 Infrastructure', 'DR restore simulation within RTO/RPO', async () => {
    await disasterRecoveryService.triggerBackup('full');
    const r = await disasterRecoveryService.simulateRestore('us-west-2');
    return r.success && r.rtoActualSeconds < 900 && r.rpoActualMinutes < 5;
  });
  await test('M1/2 Infrastructure', 'Incident lifecycle: create → resolve', () => {
    const inc = publicStatusPageService.createIncident('Test', ['API']);
    const resolved = publicStatusPageService.resolveIncident(inc.id);
    return resolved;
  });

  // Module 4: Observability
  await test('M4 Observability', 'Metrics collector records and buckets latency', () => {
    const mc = new MetricsCollector();
    for (let i = 0; i < 100; i++) mc.recordLatency('/api/test', 50 + i);
    return mc.getLatencyBuckets()[0].p95Ms > 0;
  });
  await test('M4 Observability', 'Prometheus output generated', () => {
    const mc = new MetricsCollector();
    mc.record('test_gauge', 99, 'gauge', { env: 'test' });
    return mc.getPrometheusOutput().includes('# TYPE test_gauge');
  });
  await test('M4 Observability', 'Span starts, tags, and finishes', () => {
    const span = tracingService.startSpan('op', 'svc');
    tracingService.setTag(span.spanId, 'key', 'val');
    const f = tracingService.finishSpan(span.spanId);
    return f !== undefined && f.status === 'ok';
  });
  await test('M4 Observability', 'Alert fires on threshold breach', () => {
    const am = new AlertManager();
    const fired = am.evaluateMetric('api_p95_latency_ms', 500);
    return fired.length > 0 && fired[0].severity === 'critical';
  });
  await test('M4 Observability', 'Alert auto-resolves on recovery', () => {
    const am = new AlertManager();
    am.evaluateMetric('api_p95_latency_ms', 500);
    am.evaluateMetric('api_p95_latency_ms', 100);
    return am.getActiveAlerts().length === 0;
  });

  // Module 5: Security
  await test('M5 Security', 'OWASP compliance >= 85%', () => owaspChecklist.getReport().passPct >= 85);
  await test('M5 Security', 'No failed OWASP controls', () => owaspChecklist.getFailedChecks().length === 0);
  await test('M5 Security', 'CycloneDX SBOM has 13+ components', () => sbomGenerator.generate().components.length >= 13);
  await test('M5 Security', 'Scanner UA detected and blocked', () => {
    const ad = new AnomalyDetector();
    const a = ad.recordRequest('5.5.5.5', 'sqlmap/1.7');
    return a !== null && a.type === 'scanner_detected' && a.blocked === true;
  });

  // Module 6: Compliance
  await test('M6 Compliance', 'GDPR erasure request processed', async () => {
    const req = gdprService.submitRequest('u001', 'test@test.com', 'erasure');
    return await gdprService.processErasureRequest(req.id);
  });
  await test('M6 Compliance', 'SOC2 compliance at 100%', () => complianceReportGenerator.generateReport('SOC2').compliancePct === 100);
  await test('M6 Compliance', 'ISO27001 compliance at 100%', () => complianceReportGenerator.generateReport('ISO27001').compliancePct === 100);
  await test('M6 Compliance', 'Consent record and withdrawal works', () => {
    complianceReportGenerator.recordConsent('u001', 'analytics', true);
    return complianceReportGenerator.withdrawConsent('u001', 'analytics');
  });

  // Module 7: Performance
  await test('M7 Performance', 'DB optimizer has 6+ recommendations', () => databaseOptimizer.getRecommendations().length >= 6);
  await test('M7 Performance', 'Slow queries detected above threshold', () => {
    databaseOptimizer.recordQuery('{}', 'projects', 200, false);
    return databaseOptimizer.getSlowQueries(100).length > 0;
  });
  await test('M7 Performance', 'p95 latency SLA passing (<200ms)', () => {
    const pb = new PerformanceBenchmark();
    for (let i = 0; i < 200; i++) pb.record('/test', 'GET', 200, 50 + Math.random() * 100);
    return pb.getSLACompliance().p95Passing;
  });

  // Module 8: Chaos
  await test('M8 Chaos', 'Worker kill recovery within RTO', async () => {
    const exp = chaosOrchestrator.scheduleExperiment('WK Test', 'worker', 'worker_kill', 10);
    const r = await chaosOrchestrator.runExperiment(exp.id);
    return !r.rtoBreached && !r.dataLoss;
  });
  await test('M8 Chaos', 'All chaos experiments pass', async () => {
    const types: Array<'redis_outage' | 'db_failover' | 'ai_provider_outage' | 'network_latency'> = ['redis_outage', 'db_failover', 'ai_provider_outage', 'network_latency'];
    for (const t of types) {
      const exp = chaosOrchestrator.scheduleExperiment(`${t} test`, 'system', t, 5);
      const r = await chaosOrchestrator.runExperiment(exp.id);
      if (r.rtoBreached) return false;
    }
    return true;
  });

  // Module 9: AI Quality
  await test('M9 AI Quality', 'Prompt evaluation overall >= 70', () => {
    const r = promptEvaluator.evaluate('p1', 'Create quantum computing video intro', 'Quantum computing is a revolutionary technology...');
    return r.scores.overall >= 70;
  });
  await test('M9 AI Quality', 'Video quality score > 0', () => promptEvaluator.scoreVideoQuality('v1', 1920, 8000).overallScore > 0);
  await test('M9 AI Quality', 'SEO scoring works for well-formed metadata', () => {
    const s = promptEvaluator.scoreSEO('Quantum Computing 2026: Complete Guide', 'Learn everything about quantum computing and its future applications in AI and cryptography today.', ['quantum', 'AI', 'computing', 'future', 'technology']);
    return s.overallScore > 60;
  });
  await test('M9 AI Quality', 'Hallucination detected for unsupported claims', () => {
    const r = promptEvaluator.detectHallucination('The alien spaceship appeared', ['Quantum computers are fast', 'Entanglement enables parallelism']);
    return r.hallucinated;
  });
  await test('M9 AI Quality', 'Golden regression test passes', () => {
    const tc = goldenDatasetManager.getTestCases()[0];
    const r = goldenDatasetManager.runRegressionTest(tc.id, 'quantum computing future technology', 85);
    return r.passed;
  });

  // Module 10: Learning
  await test('M10 Learning', 'Feedback ingested correctly', () => {
    const fb = feedbackIngestionService.ingestFeedback('u1', 'thumbs_up', {});
    return fb.type === 'thumbs_up';
  });
  await test('M10 Learning', 'A/B experiment created with valid split', () => {
    const exp = feedbackIngestionService.createABExperiment('Test', ['A', 'B'], [50, 50]);
    return exp.active && exp.variants.length === 2;
  });
  await test('M10 Learning', 'Variant assignment deterministic', () => {
    const exp = feedbackIngestionService.createABExperiment('Det', ['X', 'Y'], [50, 50]);
    return feedbackIngestionService.assignVariant(exp.id, 'user_xyz') === feedbackIngestionService.assignVariant(exp.id, 'user_xyz');
  });

  // Module 11: Cost
  await test('M11 Cost', 'Cost routing picks cheapest qualifying provider', () => {
    const d = providerCostRouter.routeByCost(500, 1000, 80);
    return d.provider === 'gemini' || d.provider === 'mistral'; // cheapest
  });
  await test('M11 Cost', 'Monthly forecast has positive total', () => costForecastingService.generateMonthlyForecast(10000, 1000).totalCostUSD > 0);
  await test('M11 Cost', 'Optimization savings calculated correctly', () => costForecastingService.generateMonthlyForecast(10000, 1000).savingsFromOptimizationUSD > 0);

  // Print Report
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  PHASE 6 TEST RESULTS');
  console.log('══════════════════════════════════════════════════════\n');

  const grouped = new Map<string, TestResult[]>();
  for (const r of results) {
    if (!grouped.has(r.module)) grouped.set(r.module, []);
    grouped.get(r.module)!.push(r);
  }

  let totalPassed = 0;
  let totalFailed = 0;

  for (const [module, tests] of grouped.entries()) {
    const passed = tests.filter((t) => t.passed).length;
    const failed = tests.length - passed;
    totalPassed += passed;
    totalFailed += failed;

    console.log(`\n  📦 ${module} — ${passed}/${tests.length} passed`);
    for (const t of tests) {
      const icon = t.passed ? '  ✅' : '  ❌';
      const err = t.error ? ` (${t.error})` : '';
      console.log(`${icon} ${t.name}${err}`);
    }
  }

  const totalTests = totalPassed + totalFailed;
  const passPct = Math.round((totalPassed / totalTests) * 100);

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  SUMMARY: ${totalPassed}/${totalTests} tests passed (${passPct}%)`);
  console.log(totalFailed === 0 ? '  🎉 ALL PHASE 6 TESTS PASSED — V1.0 READY FOR PRODUCTION' : `  ⚠️  ${totalFailed} test(s) failed`);
  console.log('══════════════════════════════════════════════════════\n');

  if (totalFailed > 0) process.exit(1);
}

runAllTests();
