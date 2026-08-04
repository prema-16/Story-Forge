import { IVideoProvider, VideoGenerationOptions, VideoGenerationJob } from '../interfaces/IVideoProvider';
import { logger } from '../../config/logger';

/**
 * MockVideoProvider — simulates video generation jobs with realistic status transitions.
 * Used in dev/test environments. Replace with Runway/Kling/Pika for production.
 */
export class MockVideoProvider implements IVideoProvider {
  readonly providerName = 'mock';

  // In-memory job store for mock simulation
  private jobs = new Map<string, {
    status: 'submitted' | 'processing' | 'succeeded' | 'failed';
    progress: number;
    createdAt: number;
    prompt: string;
  }>();

  isAvailable(): boolean {
    return true;
  }

  async submitJob(
    prompt: string,
    _negativePrompt: string,
    options: VideoGenerationOptions = {}
  ): Promise<{ jobId: string; estimatedTimeSeconds: number }> {
    const jobId = `mock-video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.jobs.set(jobId, {
      status: 'submitted',
      progress: 0,
      createdAt: Date.now(),
      prompt,
    });

    logger.debug(`[MockVideo] Job submitted: ${jobId}`);
    return { jobId, estimatedTimeSeconds: 30 };
  }

  async checkJobStatus(jobId: string): Promise<VideoGenerationJob> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return {
        jobId,
        status: 'failed',
        progress: 0,
        errorMessage: 'Job not found',
        provider: this.providerName,
      };
    }

    // Simulate progress over time (30s to complete)
    const elapsedMs = Date.now() - job.createdAt;
    const progressPercent = Math.min(100, Math.floor((elapsedMs / 30000) * 100));

    if (progressPercent >= 100) {
      job.status = 'succeeded';
      job.progress = 100;
    } else if (progressPercent > 0) {
      job.status = 'processing';
      job.progress = progressPercent;
    }

    this.jobs.set(jobId, job);

    return {
      jobId,
      status: job.status,
      progress: job.progress,
      provider: this.providerName,
      // Return a placeholder video URL when "complete"
      videoUrl:
        job.status === 'succeeded'
          ? `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
          : undefined,
      estimatedTimeSeconds: Math.max(0, 30 - Math.floor(elapsedMs / 1000)),
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId);
  }

  estimateCost(durationSeconds: number): number {
    return 0; // Free in mock mode
  }
}
