import { Worker, Job } from 'bullmq';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

export interface RetryJobData {
  targetQueue: string;
  originalJobId: string;
  jobData: Record<string, unknown>;
  retryAttempt: number;
}

export function startRetryWorker() {
  const worker = new Worker<RetryJobData>(
    'retry-manager',
    async (job: Job<RetryJobData>) => {
      logger.info(`[RetryWorker] Processing retry attempt ${job.data.retryAttempt} for job ${job.data.originalJobId} (Queue: ${job.data.targetQueue})`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        retriedAt: new Date().toISOString(),
        status: 'requeued',
        targetQueue: job.data.targetQueue,
      };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[RetryWorker] ✅ Retry job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[RetryWorker] ❌ Retry job ${job?.id} failed:`, err.message);
  });

  logger.info('[RetryWorker] 🔄 Retry worker started (concurrency: 5)');
  return worker;
}
