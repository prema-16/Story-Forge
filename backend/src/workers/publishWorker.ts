import { Worker, Job } from 'bullmq';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';
import { PublishJobData } from '../queues/index';
import { Project } from '../models/Project';
import { Export } from '../models/Export';
import { publishProgress } from '../services/PubSubService';

export function startPublishWorker() {
  const worker = new Worker<PublishJobData>(
    'publish',
    async (job: Job<PublishJobData>) => {
      const { projectId, exportId, platform, visibility } = job.data;
      logger.info(`[PublishWorker] Processing publish job ${job.id} for project ${projectId}`);

      await publishProgress(projectId, {
        type: 'step_started',
        step: 'publish-video',
        jobId: job.id,
        message: `Publishing video project to ${platform}...`,
      });

      const project = await Project.findById(projectId);
      if (!project) throw new Error('Project not found');

      const exportDoc = await Export.findById(exportId);
      if (!exportDoc || !exportDoc.videoUrl) throw new Error('Rendered video export not found');

      // Simulate API integration with YouTube Data API v3
      await new Promise((r) => setTimeout(r, 1500));

      await Export.findByIdAndUpdate(exportId, {
        isPublished: true,
        publishedAt: new Date(),
        youtubeVideoId: `yt_${Date.now()}`,
        youtubeUrl: `https://youtube.com/watch?v=demo_${Date.now()}`,
      });

      await publishProgress(projectId, {
        type: 'step_completed',
        step: 'publish-video',
        jobId: job.id,
        data: {
          platform,
          visibility,
          youtubeUrl: `https://youtube.com/watch?v=demo_${Date.now()}`,
        },
        message: 'Successfully published video project!',
      });

      return { success: true, platform, publishedAt: new Date().toISOString() };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[PublishWorker] ✅ Publish job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[PublishWorker] ❌ Publish job ${job?.id} failed:`, err.message);
  });

  logger.info('[PublishWorker] 🚀 Publish worker started (concurrency: 3)');
  return worker;
}
