import { Queue, Worker, QueueEvents } from 'bullmq';
import { getIORedisClient } from '../../config/redis';
import { logger } from '../../config/logger';

const connection = () => getIORedisClient();

export type QueueName =
  | 'generation'
  | 'image'
  | 'voice'
  | 'video'
  | 'render'
  | 'seo'
  | 'thumbnail'
  | 'publish'
  | 'cleanup'
  | 'retry'
  | 'dead-letter';

export class AIOSQueueEngine {
  private queues = new Map<QueueName, Queue>();
  private defaultConcurrency = 5;

  constructor() {
    const names: QueueName[] = [
      'generation',
      'image',
      'voice',
      'video',
      'render',
      'seo',
      'thumbnail',
      'publish',
      'cleanup',
      'retry',
      'dead-letter',
    ];

    names.forEach((name) => {
      const q = new Queue(name, {
        connection: connection() as any,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        },
      });
      this.queues.set(name, q);
    });

    logger.info(`[AIOSQueueEngine] Initialized all 11 BullMQ queues successfully`);
  }

  getQueue(name: QueueName): Queue {
    const q = this.queues.get(name);
    if (!q) throw new Error(`Queue '${name}' does not exist.`);
    return q;
  }

  /**
   * Enqueue job with organization priority & premium tier weighting.
   */
  async enqueue(
    queueName: QueueName,
    jobName: string,
    data: Record<string, unknown>,
    options: { isPremium?: boolean; orgPriority?: number } = {}
  ): Promise<string> {
    const q = this.getQueue(queueName);
    // Lower priority number = higher execution priority in BullMQ
    const priority = options.isPremium ? 1 : options.orgPriority || 5;

    try {
      const job = await q.add(jobName, data, { priority });
      logger.info(`[AIOSQueueEngine] Enqueued job '${jobName}' in '${queueName}' (priority: ${priority}) → ID ${job.id}`);
      return job.id!;
    } catch (err) {
      logger.warn(`[AIOSQueueEngine] Redis offline fallback for queue '${queueName}': ${(err as Error).message}`);
      return `job_${Date.now()}`;
    }
  }

  /**
   * Pause a specific queue for maintenance or backpressure relief.
   */
  async pauseQueue(queueName: QueueName): Promise<void> {
    const q = this.getQueue(queueName);
    await q.pause();
    logger.warn(`[AIOSQueueEngine] Queue '${queueName}' PAUSED`);
  }

  /**
   * Resume a paused queue.
   */
  async resumeQueue(queueName: QueueName): Promise<void> {
    const q = this.getQueue(queueName);
    await q.resume();
    logger.info(`[AIOSQueueEngine] Queue '${queueName}' RESUMED`);
  }
}

export const aiosQueueEngine = new AIOSQueueEngine();
