import { logger } from '../../config/logger';

export type VideoAIProviderId =
  | 'google-veo'
  | 'runway-gen3'
  | 'kling-1.5'
  | 'pika-2.0'
  | 'luma-dream'
  | 'sora'
  | 'wan-2.1'
  | 'pixverse'
  | 'minimax'
  | 'hailuo';

export interface VideoModelCapabilities {
  id: VideoAIProviderId;
  name: string;
  maxResolution: '1080p' | '4K';
  maxDurationSec: number;
  avgLatencySec: number;
  costPerClip: number; // USD
  supportedAspectRatios: string[];
  supportsMotionBrush: boolean;
  supportsCameraControl: boolean;
  status: 'healthy' | 'degraded' | 'offline';
}

export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  durationSec: number;
  aspectRatio: string;
  stylePreset?: string;
  providerId?: VideoAIProviderId;
}

export interface VideoGenerationOutput {
  clipUrl: string;
  providerUsed: VideoAIProviderId;
  latencyMs: number;
  cost: number;
  resolution: string;
  fps: number;
}

export class NextGenVideoRegistry {
  private providers = new Map<VideoAIProviderId, VideoModelCapabilities>();

  constructor() {
    this.registerCapabilities({ id: 'google-veo', name: 'Google Veo', maxResolution: '4K', maxDurationSec: 60, avgLatencySec: 45, costPerClip: 0.15, supportedAspectRatios: ['16:9', '9:16', '1:1'], supportsMotionBrush: true, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'runway-gen3', name: 'Runway Gen-3 Alpha', maxResolution: '4K', maxDurationSec: 30, avgLatencySec: 35, costPerClip: 0.25, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: true, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'kling-1.5', name: 'Kling AI 1.5', maxResolution: '1080p', maxDurationSec: 30, avgLatencySec: 25, costPerClip: 0.10, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: false, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'pika-2.0', name: 'Pika 2.0', maxResolution: '1080p', maxDurationSec: 15, avgLatencySec: 20, costPerClip: 0.08, supportedAspectRatios: ['16:9', '9:16', '1:1'], supportsMotionBrush: true, supportsCameraControl: false, status: 'healthy' });
    this.registerCapabilities({ id: 'luma-dream', name: 'Luma Dream Machine', maxResolution: '1080p', maxDurationSec: 20, avgLatencySec: 30, costPerClip: 0.12, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: false, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'sora', name: 'OpenAI Sora', maxResolution: '4K', maxDurationSec: 60, avgLatencySec: 60, costPerClip: 0.40, supportedAspectRatios: ['16:9', '9:16', '1:1'], supportsMotionBrush: true, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'wan-2.1', name: 'Wan 2.1 Video', maxResolution: '1080p', maxDurationSec: 30, avgLatencySec: 22, costPerClip: 0.09, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: false, supportsCameraControl: false, status: 'healthy' });
    this.registerCapabilities({ id: 'pixverse', name: 'PixVerse V2', maxResolution: '1080p', maxDurationSec: 15, avgLatencySec: 18, costPerClip: 0.07, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: true, supportsCameraControl: false, status: 'healthy' });
    this.registerCapabilities({ id: 'minimax', name: 'MiniMax Hailuo', maxResolution: '1080p', maxDurationSec: 30, avgLatencySec: 25, costPerClip: 0.10, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: false, supportsCameraControl: true, status: 'healthy' });
    this.registerCapabilities({ id: 'hailuo', name: 'Hailuo AI Engine', maxResolution: '1080p', maxDurationSec: 20, avgLatencySec: 24, costPerClip: 0.08, supportedAspectRatios: ['16:9', '9:16'], supportsMotionBrush: false, supportsCameraControl: false, status: 'healthy' });
  }

  registerCapabilities(cap: VideoModelCapabilities): void {
    this.providers.set(cap.id, cap);
    logger.info(`[NextGenVideoRegistry] Registered video AI provider '${cap.id}' (${cap.name})`);
  }

  getOptimalProvider(params: VideoGenerationParams): VideoModelCapabilities {
    if (params.providerId && this.providers.has(params.providerId)) {
      return this.providers.get(params.providerId)!;
    }

    // Default to lowest latency healthy provider matching aspect ratio
    const healthy = Array.from(this.providers.values()).filter((p) => p.status === 'healthy');
    const matched = healthy.find((p) => p.supportedAspectRatios.includes(params.aspectRatio));
    return matched || healthy[0] || this.providers.get('runway-gen3')!;
  }

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationOutput> {
    const startTime = Date.now();
    const provider = this.getOptimalProvider(params);

    logger.info(`[NextGenVideoRegistry] Generating video via '${provider.id}' for prompt: "${params.prompt.slice(0, 60)}..."`);

    // Simulated provider rendering call with dynamic parameters
    const latency = provider.avgLatencySec * 10; // Simulation
    const clipUrl = `https://storage.storyforge.ai/renders/clip_${provider.id}_${Date.now()}.mp4`;

    return {
      clipUrl,
      providerUsed: provider.id,
      latencyMs: Date.now() - startTime + latency,
      cost: provider.costPerClip,
      resolution: provider.maxResolution,
      fps: 60,
    };
  }

  listProviders(): VideoModelCapabilities[] {
    return Array.from(this.providers.values());
  }
}

export const nextGenVideoRegistry = new NextGenVideoRegistry();
