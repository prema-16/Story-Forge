import axios from 'axios';
import {
  IVideoProvider,
  VideoGenerationOptions,
  VideoGenerationJob,
} from '../interfaces/IVideoProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const RUNWAY_BASE = 'https://api.dev.runwayml.com/v1';

export class RunwayProvider implements IVideoProvider {
  readonly providerName = 'runway';

  constructor() {
    if (!env.RUNWAY_API_KEY) throw new Error('RUNWAY_API_KEY is required');
  }

  isAvailable(): boolean {
    return !!env.RUNWAY_API_KEY;
  }

  async submitJob(
    prompt: string,
    negativePrompt: string,
    options: VideoGenerationOptions = {}
  ): Promise<{ jobId: string; estimatedTimeSeconds: number }> {
    logger.info(`[Runway] Submitting Gen-3 job — ${options.duration ?? 5}s, ${options.aspectRatio ?? '16:9'}`);

    const ratioMap: Record<string, string> = {
      '16:9': '1280:768',
      '9:16': '768:1280',
      '1:1': '960:960',
    };

    const response = await axios.post(
      `${RUNWAY_BASE}/image_to_video`,
      {
        model: 'gen3a_turbo',
        promptText: prompt,
        duration: Math.min(options.duration ?? 5, 10),
        ratio: ratioMap[options.aspectRatio || '16:9'] || '1280:768',
      },
      {
        headers: {
          Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        timeout: 30_000,
      }
    );

    const jobId = response.data.id;
    logger.info(`[Runway] Job submitted: ${jobId}`);

    return { jobId, estimatedTimeSeconds: 120 };
  }

  async checkJobStatus(jobId: string): Promise<VideoGenerationJob> {
    const response = await axios.get(`${RUNWAY_BASE}/tasks/${jobId}`, {
      headers: {
        Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
      timeout: 15_000,
    });

    const task = response.data;
    const statusMap: Record<string, VideoGenerationJob['status']> = {
      PENDING: 'submitted',
      RUNNING: 'processing',
      SUCCEEDED: 'succeeded',
      FAILED: 'failed',
      CANCELLED: 'failed',
    };

    return {
      jobId,
      status: statusMap[task.status] || 'processing',
      progress: task.progress || 0,
      videoUrl: task.output?.[0],
      estimatedTimeSeconds: 120,
      errorMessage: task.failure,
      provider: this.providerName,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      await axios.delete(`${RUNWAY_BASE}/tasks/${jobId}`, {
        headers: {
          Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  estimateCost(durationSeconds: number): number {
    // Runway Gen-3 Turbo: ~$0.05 per second
    return durationSeconds * 0.05;
  }
}
