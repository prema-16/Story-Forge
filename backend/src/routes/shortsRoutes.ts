import { Router, Response } from 'express';
import { sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { shortsEngineService } from '../services/ShortsEngineService';
import { aiClipFinderService } from '../services/AIClipFinderService';
import { shortsPublishingService } from '../services/ShortsPublishingService';

const router = Router();

router.use(protect);

/**
 * POST /api/shorts/generate
 * Create a new AI Short Project
 */
router.post('/generate', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const {
    title, inputType, sourceContent, targetDurationSeconds,
    visualStyle, videoProvider, subtitleStyle
  } = req.body;

  const project = shortsEngineService.createShortsProject({
    userId,
    title: title || 'Viral AI Tech Breakthrough',
    inputType: inputType || 'prompt',
    sourceContent: sourceContent || 'How AI automation is scaling enterprises in 2026',
    targetDurationSeconds: targetDurationSeconds || 30,
    visualStyle: visualStyle || 'cyberpunk',
    videoProvider: videoProvider || 'auto',
    subtitleStyle: subtitleStyle || 'mrbeast',
  });

  sendSuccess(res, { project });
}));

/**
 * POST /api/shorts/hooks
 * Generate 10+ hook variations for a topic
 */
router.post('/hooks', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { topic, inputType } = req.body;
  const hooks = shortsEngineService.generateHooks(topic || 'Technology', inputType || 'prompt');
  sendSuccess(res, { hooks });
}));

/**
 * POST /api/shorts/virality-score
 * Calculate 0-100 Virality Score and Retention Prediction
 */
router.post('/virality-score', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { durationSeconds, title } = req.body;
  const duration = durationSeconds || 30;
  const viralityScore = shortsEngineService.calculateViralityScore({ title });
  const retentionPrediction = shortsEngineService.predictRetention(duration);
  sendSuccess(res, { viralityScore, retentionPrediction });
}));

/**
 * POST /api/shorts/clip-finder
 * Extract 10/20/50 viral clips from long video/podcast
 */
router.post('/clip-finder', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sourceUrlOrFile, requestedCount } = req.body;
  const clips = await aiClipFinderService.extractClips({
    sourceUrlOrFile: sourceUrlOrFile || 'https://youtube.com/watch?v=demo',
    requestedCount: requestedCount || 10,
  });
  sendSuccess(res, { clips });
}));

/**
 * POST /api/shorts/batch
 * Batch generate 10 to 500 shorts
 */
router.post('/batch', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { count, topic } = req.body;
  const totalCount = count || 10;
  const projects = Array.from({ length: Math.min(totalCount, 500) }, (_, i) =>
    shortsEngineService.createShortsProject({
      userId: req.user!._id.toString(),
      title: `${topic || 'Batch Topic'} #${i + 1}`,
      inputType: 'prompt',
      sourceContent: 'Automated batch short generation',
      targetDurationSeconds: 30,
      visualStyle: 'cyberpunk',
      videoProvider: 'auto',
      subtitleStyle: 'capcut',
    })
  );

  const batchJob = {
    id: `batch_job_${Date.now()}`,
    userId: req.user!._id.toString(),
    totalShortsCount: totalCount,
    completedCount: totalCount,
    failedCount: 0,
    totalCreditsRequired: totalCount * 12,
    status: 'completed' as const,
    progressPercentage: 100,
    estimatedEtaSeconds: 0,
    shortsProjects: projects,
    createdAt: new Date().toISOString(),
  };

  sendSuccess(res, { batchJob });
}));

/**
 * POST /api/shorts/publish
 * Multi-platform video distribution
 */
router.post('/publish', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { shortProjectId, platforms, title, description, hashtags, scheduledTimeIso } = req.body;
  const results = await shortsPublishingService.publishToAllPlatforms({
    shortProjectId: shortProjectId || 'short_proj_demo',
    platforms: platforms || ['youtube_shorts', 'tiktok', 'instagram_reels'],
    title: title || 'Unbelievable AI Breakthrough!',
    description: description || 'Check out this 30-second AI breakdown.',
    hashtags: hashtags || ['#Shorts', '#AI', '#Tech'],
    scheduledTimeIso,
  });
  sendSuccess(res, { publishingResults: results });
}));

/**
 * GET /api/shorts/analytics
 * Get Shorts performance analytics
 */
router.get('/analytics', asyncHandler(async (_req: AuthRequest, res: Response) => {
  const analytics = {
    totalViews: 1450200,
    averageCTR: 11.4,
    averageCompletionRate: 64.2,
    totalShares: 48900,
    totalLikes: 198000,
    totalComments: 34500,
    subscribersGained: 12800,
    estimatedRevenueUSD: 3420.50,
    averageRPM: 2.35,
    platformBreakdown: {
      youtube_shorts: { views: 720000, ctr: 12.1, retention: 68.0 },
      tiktok: { views: 480000, ctr: 10.8, retention: 62.5 },
      instagram_reels: { views: 250200, ctr: 11.2, retention: 61.8 },
    },
  };
  sendSuccess(res, { analytics });
}));

export default router;
