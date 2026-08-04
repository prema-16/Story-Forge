import { Worker, Job } from 'bullmq';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { CleanupJobData } from '../queues/index';

export function startCleanupWorker() {
  const worker = new Worker<CleanupJobData>(
    'cleanup',
    async (job: Job<CleanupJobData>) => {
      const { type, resourceId, cloudinaryPublicIds } = job.data;
      logger.info(`[CleanupWorker] Cleaning up ${type} ${resourceId}`);

      // Step 1: Remove local exports directory if exists
      const exportsDir = path.join(process.cwd(), 'exports', resourceId);
      if (fs.existsSync(exportsDir)) {
        try {
          fs.rmSync(exportsDir, { recursive: true, force: true });
          logger.info(`[CleanupWorker] Purged local directory: ${exportsDir}`);
        } catch (err) {
          logger.warn(`[CleanupWorker] Failed to purge directory ${exportsDir}:`, (err as Error).message);
        }
      }

      // Step 2: Destroy Cloudinary assets if public IDs provided
      if (cloudinaryPublicIds && cloudinaryPublicIds.length > 0 && process.env.CLOUDINARY_CLOUD_NAME) {
        for (const publicId of cloudinaryPublicIds) {
          try {
            await cloudinary.uploader.destroy(publicId);
            logger.info(`[CleanupWorker] Cloudinary asset destroyed: ${publicId}`);
          } catch (err) {
            logger.warn(`[CleanupWorker] Cloudinary asset destroy failed for ${publicId}:`, (err as Error).message);
          }
        }
      }

      return { success: true, resourceId, cleanedAt: new Date().toISOString() };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[CleanupWorker] ✅ Cleanup job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[CleanupWorker] ❌ Cleanup job ${job?.id} failed:`, err.message);
  });

  logger.info('[CleanupWorker] 🧹 Cleanup worker started (concurrency: 5)');
  return worker;
}
