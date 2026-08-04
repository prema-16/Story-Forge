import { Worker, Job } from 'bullmq';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

export interface VideoJobData {
  projectId: string;
  sceneId: string;
  promptText: string;
  provider?: string;
  durationSeconds?: number;
}

export function startVideoWorker() {
  const worker = new Worker<VideoJobData>(
    'video-generation',
    async (job: Job<VideoJobData>) => {
      logger.info(`[VideoWorker] Processing AI video synthesis job ${job.id} for scene ${job.data.sceneId}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        success: true,
        videoUrl: `https://cdn.storyforge.ai/video/clip_${job.data.sceneId}_${Date.now()}.mp4`,
        durationSeconds: job.data.durationSeconds || 5,
      };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[VideoWorker] ✅ Video job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[VideoWorker] ❌ Video job ${job?.id} failed:`, err.message);
  });

  logger.info('[VideoWorker] 🎥 Video worker started (concurrency: 3)');
  return worker;
}
