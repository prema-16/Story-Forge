import { Worker, Job } from 'bullmq';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

export interface ImageJobData {
  projectId: string;
  sceneId: string;
  promptText: string;
  provider?: string;
  aspectRatio?: string;
}

export function startImageWorker() {
  const worker = new Worker<ImageJobData>(
    'image-generation',
    async (job: Job<ImageJobData>) => {
      logger.info(`[ImageWorker] Processing image generation job ${job.id} for scene ${job.data.sceneId}`);
      // Simulate image generation processing
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        imageUrl: `https://cdn.storyforge.ai/images/scene_${job.data.sceneId}_${Date.now()}.png`,
        generatedAt: new Date().toISOString(),
      };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[ImageWorker] ✅ Image job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[ImageWorker] ❌ Image job ${job?.id} failed:`, err.message);
  });

  logger.info('[ImageWorker] 🖼️ Image worker started (concurrency: 5)');
  return worker;
}
