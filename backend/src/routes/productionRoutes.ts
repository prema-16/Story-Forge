import { Router, Request, Response } from 'express';
import { renderFarmScheduler } from '../rendering/RenderFarmScheduler';
import { distributedRenderEngine } from '../rendering/DistributedRenderEngine';
import { encodingSystem } from '../encoding/EncodingSystem';
import { publishingEngine } from '../publishing/PublishingEngine';
import { automationEngine } from '../automation/AutomationEngine';
import { backupRecoveryEngine } from '../backup/BackupRecoveryEngine';
import { renderCostEstimator } from '../rendering/extras/ProductionExtras';
import { sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /production/workers:
 *   get:
 *     summary: Get render farm worker nodes and CPU/GPU utilization
 *     tags: [Production Platform]
 */
router.get('/workers', asyncHandler(async (_req: Request, res: Response) => {
  const workers = renderFarmScheduler.getWorkerMetrics();
  sendSuccess(res, { workers });
}));

/**
 * @openapi
 * /production/render:
 *   post:
 *     summary: Launch distributed video render job with checkpoint recovery
 *     tags: [Production Platform]
 */
router.post('/render', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, resolution, format, quality, totalScenes } = req.body;
  const jobId = `render_${projectId}_${Date.now()}`;

  const estimatedCostUSD = renderCostEstimator.estimateRenderCost(resolution || '1080p', (totalScenes || 5) * 10);

  const result = await distributedRenderEngine.renderDistributed({
    jobId,
    projectId: projectId || 'demo-proj-1',
    resolution: resolution || '1080p',
    format: format || 'mp4',
    quality: quality || 'standard',
    totalScenes: totalScenes || 5,
  });

  sendSuccess(res, { render: result, estimatedCostUSD });
}));

/**
 * @openapi
 * /production/transcode:
 *   post:
 *     summary: Transcode video asset to MP4, H.265, WebM, GIF, or PNG sequence
 *     tags: [Production Platform]
 */
router.post('/transcode', asyncHandler(async (req: Request, res: Response) => {
  const { inputPath, format, qualityPreset } = req.body;
  const result = await encodingSystem.transcode({
    inputPath: inputPath || '/raw/video.mov',
    outputPath: `/exports/transcoded_${Date.now()}.${format || 'mp4'}`,
    format: format || 'mp4',
    qualityPreset: qualityPreset || 'standard',
  });
  sendSuccess(res, { transcode: result });
}));

/**
 * @openapi
 * /production/publish:
 *   post:
 *     summary: Publish video export to YouTube, TikTok, Instagram, X, etc.
 *     tags: [Production Platform]
 */
router.post('/publish', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, platforms, title, description, tags, visibility } = req.body;
  const results = await publishingEngine.publishToPlatforms({
    id: `pub_${Date.now()}`,
    projectId: projectId || 'demo-proj-1',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    platforms: platforms || ['youtube', 'tiktok'],
    title: title || 'Quantum Physics: Secrets of the Universe',
    description: description || 'Exploring quantum entanglement.',
    tags: tags || ['AI', 'Physics'],
    visibility: visibility || 'public',
  });
  sendSuccess(res, { publishingResults: results });
}));

/**
 * @openapi
 * /production/automation:
 *   get:
 *     summary: List active automation rules and cron triggers
 *     tags: [Production Platform]
 */
router.get('/automation', asyncHandler(async (_req: Request, res: Response) => {
  const rules = automationEngine.listRules();
  sendSuccess(res, { rules });
}));

/**
 * @openapi
 * /production/backups:
 *   post:
 *     summary: Trigger project snapshot or database backup
 *     tags: [Production Platform]
 */
router.post('/backups', asyncHandler(async (req: Request, res: Response) => {
  const { type, projectId } = req.body;
  const backup = await backupRecoveryEngine.createBackup(type || 'project_snapshot', projectId);
  sendSuccess(res, { backup });
}));

export default router;
