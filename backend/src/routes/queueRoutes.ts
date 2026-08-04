import { Router, Request, Response } from 'express';
import {
  generationQueue,
  renderQueue,
  publishQueue,
  cleanupQueue,
  dlqQueue,
  getQueueMetrics,
  pauseQueue,
  resumeQueue,
} from '../queues';
import { workerManager } from '../services/WorkerManager';
import { getIORedisClient } from '../config/redis';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { logger } from '../config/logger';

const router = Router();

// Protect queue admin routes
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

const queuesMap = {
  generation: generationQueue,
  render: renderQueue,
  publish: publishQueue,
  cleanup: cleanupQueue,
  'dead-letter': dlqQueue,
};

/**
 * GET /api/admin/queues — Full queue metrics snapshot
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const metrics = await Promise.all([
      getQueueMetrics(generationQueue),
      getQueueMetrics(renderQueue),
      getQueueMetrics(publishQueue),
      getQueueMetrics(cleanupQueue),
      getQueueMetrics(dlqQueue),
    ]);

    const redis = getIORedisClient();
    let redisStatus = 'disconnected';
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch {
      redisStatus = 'error';
    }

    res.json({
      success: true,
      data: {
        redisStatus,
        queues: metrics,
        workers: workerManager.getAll(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/queues/workers — Worker statuses
 */
router.get('/workers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: workerManager.getAll(),
  });
});

/**
 * POST /api/admin/queues/:name/pause — Pause a queue
 */
router.post('/:name/pause', async (req: Request, res: Response) => {
  const qName = req.params.name as keyof typeof queuesMap;
  const queue = queuesMap[qName];
  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  await pauseQueue(queue);
  res.json({ success: true, message: `Queue ${qName} paused` });
});

/**
 * POST /api/admin/queues/:name/resume — Resume a queue
 */
router.post('/:name/resume', async (req: Request, res: Response) => {
  const qName = req.params.name as keyof typeof queuesMap;
  const queue = queuesMap[qName];
  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  await resumeQueue(queue);
  res.json({ success: true, message: `Queue ${qName} resumed` });
});

/**
 * POST /api/admin/queues/:name/retry — Retry failed jobs in queue
 */
router.post('/:name/retry', async (req: Request, res: Response) => {
  const qName = req.params.name as keyof typeof queuesMap;
  const queue = queuesMap[qName];
  if (!queue) {
    return res.status(404).json({ success: false, error: 'Queue not found' });
  }

  try {
    const failedJobs = await queue.getFailed();
    for (const job of failedJobs) {
      await job.retry();
    }
    res.json({ success: true, message: `Retried ${failedJobs.length} failed jobs in ${qName}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/queues/sse — SSE live metrics stream
 */
router.get('/sse', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendMetrics = async () => {
    try {
      const metrics = await Promise.all([
        getQueueMetrics(generationQueue),
        getQueueMetrics(renderQueue),
        getQueueMetrics(publishQueue),
        getQueueMetrics(cleanupQueue),
        getQueueMetrics(dlqQueue),
      ]);

      const redis = getIORedisClient();
      let redisStatus = 'disconnected';
      try {
        await redis.ping();
        redisStatus = 'connected';
      } catch {
        redisStatus = 'error';
      }

      res.write(
        `data: ${JSON.stringify({
          redisStatus,
          queues: metrics,
          workers: workerManager.getAll(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        })}\n\n`
      );
    } catch (err: any) {
      logger.error('[QueueSSE] Error building metrics:', err.message);
    }
  };

  sendMetrics();
  const interval = setInterval(sendMetrics, 3000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
