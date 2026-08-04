import { Router, Response } from 'express';
import { sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';

// Infrastructure
import { globalDeploymentManager } from '../infrastructure/GlobalDeploymentManager';
import { regionFailoverService } from '../infrastructure/RegionFailoverService';
import { healthScoreEngine } from '../infrastructure/HealthScoreEngine';
import { predictiveScalingService } from '../infrastructure/PredictiveScalingService';
import { disasterRecoveryService } from '../infrastructure/DisasterRecoveryService';
import { publicStatusPageService } from '../infrastructure/PublicStatusPageService';

// Observability
import { metricsCollector } from '../observability/MetricsCollector';
import { tracingService } from '../observability/TracingService';
import { alertManager } from '../observability/AlertManager';

// Security
import { owaspChecklist } from '../security/OWASPChecklist';
import { sbomGenerator } from '../security/SBOMGenerator';
import { anomalyDetector } from '../security/AnomalyDetector';

// Compliance
import { gdprService } from '../compliance/GDPRService';
import { complianceReportGenerator } from '../compliance/ComplianceReportGenerator';

// Performance
import { databaseOptimizer } from '../performance/DatabaseOptimizer';
import { performanceBenchmark } from '../performance/PerformanceBenchmark';

// Chaos
import { chaosOrchestrator } from '../chaos/ChaosOrchestrator';

// Evaluation
import { promptEvaluator } from '../evaluation/PromptEvaluator';
import { goldenDatasetManager } from '../evaluation/GoldenDatasetManager';

// Learning
import { feedbackIngestionService } from '../learning/FeedbackIngestionService';

// Cost
import { providerCostRouter } from '../cost/ProviderCostRouter';
import { costForecastingService } from '../cost/CostForecastingService';

const router = Router();

// Public status page - no auth required
router.get('/status', asyncHandler(async (_req, res) => {
  sendSuccess(res, publicStatusPageService.getStatusPage());
}));

router.get('/status/uptime', asyncHandler(async (_req, res) => {
  sendSuccess(res, publicStatusPageService.getUptimeSummary());
}));

// All other routes require auth
router.use(protect);

/* ── Infrastructure ───────────────────────────────── */
router.get('/infrastructure/regions', asyncHandler(async (_req, res) => {
  sendSuccess(res, { topology: globalDeploymentManager.getRegionTopology() });
}));

router.get('/infrastructure/health-score', asyncHandler(async (_req, res) => {
  const report = healthScoreEngine.generateSampleReport();
  sendSuccess(res, { healthScore: report });
}));

router.get('/infrastructure/scaling-forecast', asyncHandler(async (req, res) => {
  const rps = parseInt(req.query.rps as string) || 500;
  predictiveScalingService.recordLoad(rps);
  const forecast = predictiveScalingService.generateForecast();
  sendSuccess(res, { forecast });
}));

router.get('/infrastructure/disaster-recovery', asyncHandler(async (_req, res) => {
  sendSuccess(res, { dr: disasterRecoveryService.getDRStatus(), history: disasterRecoveryService.getBackupHistory() });
}));

router.post('/infrastructure/disaster-recovery/backup', asyncHandler(async (req, res) => {
  const { type = 'incremental', region } = req.body;
  const backup = await disasterRecoveryService.triggerBackup(type, region);
  sendSuccess(res, { backup });
}));

router.post('/infrastructure/disaster-recovery/simulate-restore', asyncHandler(async (req, res) => {
  const { targetRegion = 'us-east-1' } = req.body;
  const result = await disasterRecoveryService.simulateRestore(targetRegion);
  sendSuccess(res, { result });
}));

router.post('/infrastructure/failover', asyncHandler(async (req, res) => {
  const { failedRegion, reason } = req.body;
  const event = await regionFailoverService.performFailover(failedRegion, reason || 'manual trigger');
  sendSuccess(res, { failoverEvent: event });
}));

/* ── Observability ────────────────────────────────── */
router.get('/observability/metrics', asyncHandler(async (_req, res) => {
  sendSuccess(res, metricsCollector.getSummary());
}));

router.get('/observability/metrics/prometheus', asyncHandler(async (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(metricsCollector.getPrometheusOutput());
}));

router.get('/observability/traces', asyncHandler(async (_req, res) => {
  sendSuccess(res, tracingService.getSummary());
}));

router.get('/observability/alerts', asyncHandler(async (_req, res) => {
  sendSuccess(res, { alerts: alertManager.getActiveAlerts(), summary: alertManager.getAlertSummary(), rules: alertManager.getRules() });
}));

/* ── Security ─────────────────────────────────────── */
router.get('/security/owasp', asyncHandler(async (_req, res) => {
  sendSuccess(res, { report: owaspChecklist.getReport(), checklist: owaspChecklist.getChecklist(), failures: owaspChecklist.getFailedChecks() });
}));

router.get('/security/sbom', asyncHandler(async (_req, res) => {
  const sbom = sbomGenerator.generate();
  sendSuccess(res, { sbom, licenseSummary: sbomGenerator.getLicenseSummary() });
}));

router.get('/security/anomalies', asyncHandler(async (req, res) => {
  const { severity } = req.query;
  sendSuccess(res, { anomalies: anomalyDetector.getAnomalies(severity as any), summary: anomalyDetector.getSummary() });
}));

/* ── Compliance ───────────────────────────────────── */
router.get('/compliance/report', asyncHandler(async (req, res) => {
  const framework = (req.query.framework as 'GDPR' | 'SOC2' | 'ISO27001') || 'GDPR';
  const report = complianceReportGenerator.generateReport(framework);
  sendSuccess(res, { report, allFrameworks: complianceReportGenerator.getAllFrameworkSummary() });
}));

router.post('/compliance/gdpr/request', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, email } = req.body;
  const userId = req.user!._id.toString();
  const request = gdprService.submitRequest(userId, email || req.user!.email, type);
  sendSuccess(res, { request });
}));

router.get('/compliance/gdpr/summary', asyncHandler(async (_req, res) => {
  sendSuccess(res, gdprService.getComplianceSummary());
}));

/* ── Performance ──────────────────────────────────── */
router.get('/performance/benchmarks', asyncHandler(async (_req, res) => {
  const stats = performanceBenchmark.getRouteStats();
  const sla = performanceBenchmark.getSLACompliance();
  sendSuccess(res, { stats, sla });
}));

router.get('/performance/database', asyncHandler(async (_req, res) => {
  sendSuccess(res, {
    report: databaseOptimizer.getOptimizationReport(),
    recommendations: databaseOptimizer.getRecommendations(),
    indexDDL: databaseOptimizer.generateIndexDDL(),
    slowQueries: databaseOptimizer.getSlowQueries(),
  });
}));

/* ── Chaos Engineering ───────────────────────────── */
router.get('/chaos/experiments', asyncHandler(async (_req, res) => {
  sendSuccess(res, { experiments: chaosOrchestrator.getExperiments(), benchmarks: chaosOrchestrator.getBenchmarks(), report: chaosOrchestrator.getChaosReport() });
}));

router.post('/chaos/run', asyncHandler(async (req, res) => {
  const { name, target, type, durationSeconds } = req.body;
  const exp = chaosOrchestrator.scheduleExperiment(name, target, type, durationSeconds);
  const result = await chaosOrchestrator.runExperiment(exp.id);
  sendSuccess(res, { experiment: exp, result });
}));

/* ── AI Evaluation ───────────────────────────────── */
router.post('/evaluation/prompt', asyncHandler(async (req, res) => {
  const { prompt, response } = req.body;
  const result = promptEvaluator.evaluate(`eval_${Date.now()}`, prompt, response);
  sendSuccess(res, { result });
}));

router.post('/evaluation/seo', asyncHandler(async (req, res) => {
  const { title, description, tags } = req.body;
  const score = promptEvaluator.scoreSEO(title || '', description || '', tags || []);
  sendSuccess(res, { score });
}));

router.post('/evaluation/thumbnail', asyncHandler(async (req, res) => {
  const { thumbnailUrl } = req.body;
  const score = promptEvaluator.scoreThumbnail(thumbnailUrl || '');
  sendSuccess(res, { score });
}));

router.post('/evaluation/hallucination', asyncHandler(async (req, res) => {
  const { claim, facts } = req.body;
  const result = promptEvaluator.detectHallucination(claim, facts || []);
  sendSuccess(res, { result });
}));

router.get('/evaluation/golden-datasets', asyncHandler(async (_req, res) => {
  sendSuccess(res, { testCases: goldenDatasetManager.getTestCases(), regressionSummary: goldenDatasetManager.getRegressionSummary() });
}));

/* ── Continuous Learning ─────────────────────────── */
router.post('/learning/feedback', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, rating, comment, projectId, context } = req.body;
  const userId = req.user!._id.toString();
  const fb = feedbackIngestionService.ingestFeedback(userId, type, context || {}, rating, comment, projectId);
  sendSuccess(res, { feedback: fb });
}));

router.post('/learning/ab-experiment', asyncHandler(async (req, res) => {
  const { name, variants, trafficSplit } = req.body;
  const exp = feedbackIngestionService.createABExperiment(name, variants, trafficSplit);
  sendSuccess(res, { experiment: exp });
}));

router.get('/learning/feedback/summary', asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined;
  sendSuccess(res, feedbackIngestionService.getFeedbackSummary(userId));
}));

/* ── Cost Optimization ───────────────────────────── */
router.get('/cost/forecast', asyncHandler(async (req, res) => {
  const dau = parseInt(req.query.dau as string) || 10000;
  const dailyRenders = parseInt(req.query.renders as string) || 1000;
  const forecast = costForecastingService.generateMonthlyForecast(dau, dailyRenders);
  sendSuccess(res, { forecast });
}));

router.get('/cost/provider-comparison', asyncHandler(async (req, res) => {
  const inputTokens = parseInt(req.query.inputTokens as string) || 500;
  const outputTokens = parseInt(req.query.outputTokens as string) || 1000;
  const costRoute = providerCostRouter.routeByCost(inputTokens, outputTokens);
  const latencyRoute = providerCostRouter.routeByLatency(2000);
  const monthly = providerCostRouter.getCostForecast(100000, inputTokens, outputTokens);
  sendSuccess(res, { costOptimalRoute: costRoute, latencyOptimalRoute: latencyRoute, monthlyForecast: monthly });
}));

export default router;
