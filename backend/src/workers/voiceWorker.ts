import { Worker, Job } from 'bullmq';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

export interface VoiceJobData {
  projectId: string;
  text: string;
  voiceId: string;
  provider?: string;
  speed?: number;
}

export function startVoiceWorker() {
  const worker = new Worker<VoiceJobData>(
    'voice-generation',
    async (job: Job<VoiceJobData>) => {
      logger.info(`[VoiceWorker] Processing voice synthesis job ${job.id} for project ${job.data.projectId}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        success: true,
        audioUrl: `https://cdn.storyforge.ai/audio/voice_${job.data.projectId}_${Date.now()}.mp3`,
        durationSeconds: Math.max(5, Math.ceil(job.data.text.split(' ').length / 3)),
      };
    },
    {
      connection: getIORedisClient() as any,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`[VoiceWorker] ✅ Voice job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[VoiceWorker] ❌ Voice job ${job?.id} failed:`, err.message);
  });

  logger.info('[VoiceWorker] 🎙️ Voice worker started (concurrency: 5)');
  return worker;
}
