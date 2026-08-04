export interface VideoGenerationOptions {
  duration?: number; // seconds
  aspectRatio?: '16:9' | '9:16' | '1:1';
  resolution?: '720p' | '1080p' | '4K';
  fps?: number;
  motionIntensity?: 'low' | 'medium' | 'high';
}

export type VideoJobStatus = 'submitted' | 'processing' | 'succeeded' | 'failed';

export interface VideoGenerationJob {
  jobId: string;
  status: VideoJobStatus;
  progress: number; // 0-100
  videoUrl?: string;
  estimatedTimeSeconds?: number;
  errorMessage?: string;
  provider: string;
}

export interface IVideoProvider {
  readonly providerName: string;

  submitJob(
    prompt: string,
    negativePrompt: string,
    options?: VideoGenerationOptions
  ): Promise<{ jobId: string; estimatedTimeSeconds: number }>;

  checkJobStatus(jobId: string): Promise<VideoGenerationJob>;
  cancelJob(jobId: string): Promise<boolean>;
  isAvailable(): boolean;
  estimateCost(durationSeconds: number, options?: VideoGenerationOptions): number;
}
