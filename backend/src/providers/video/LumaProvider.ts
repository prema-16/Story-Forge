import axios from 'axios';
import {
  IVideoProvider,
  VideoGenerationOptions,
  VideoGenerationJob,
} from '../interfaces/IVideoProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const LUMA_BASE = 'https://api.lumalabs.ai/dream-machine/v1';

export class LumaProvider implements IVideoProvider {
  readonly providerName = 'luma';

  constructor() {
    if (!env.LUMA_API_KEY) throw new Error('LUMA_API_KEY is required');
  }

  isAvailable(): boolean {
    return !!env.LUMA_API_KEY;
  }

  async submitJob(
    prompt: string,
    _negativePrompt: string,
    options: VideoGenerationOptions = {}
  ): Promise<{ jobId: string; estimatedTimeSeconds: number }> {
    const aspectRatio = options.aspectRatio ?? '16:9';

    logger.info(`[Luma] Submitting Dream Machine job — ${options.duration ?? 5}s, ${aspectRatio}`);

    const response = await axios.post(
      `${LUMA_BASE}/generations`,
      {
        prompt,
        aspect_ratio: aspectRatio,
        loop: false,
      },
      {
        headers: {
          Authorization: `Bearer ${env.LUMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      }
    );

    const jobId = response.data.id;
    logger.info(`[Luma] Job submitted: ${jobId}`);

    return { jobId, estimatedTimeSeconds: 90 };
  }

  async checkJobStatus(jobId: string): Promise<VideoGenerationJob> {
    const response = await axios.get(`${LUMA_BASE}/generations/${jobId}`, {
      headers: {
        Authorization: `Bearer ${env.LUMA_API_KEY}`,
      },
      timeout: 15_000,
    });

    const data = response.data;

    const statusMap: Record<string, VideoGenerationJob['status']> = {
      pending: 'submitted',
      dreaming: 'processing',
      completed: 'succeeded',
      failed: 'failed',
    };

    return {
      jobId,
      status: statusMap[data.state] ?? 'processing',
      progress: data.state === 'completed' ? 100 : data.state === 'failed' ? 0 : 50,
      videoUrl: data.assets?.video ?? undefined,
      estimatedTimeSeconds: 90,
      errorMessage: data.failure_reason ?? undefined,
      provider: this.providerName,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      await axios.delete(`${LUMA_BASE}/generations/${jobId}`, {
        headers: {
          Authorization: `Bearer ${env.LUMA_API_KEY}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  estimateCost(durationSeconds: number): number {
    // Luma Dream Machine: ~$0.003 per second (very cost-effective)
    return durationSeconds * 0.003;
  }
}
