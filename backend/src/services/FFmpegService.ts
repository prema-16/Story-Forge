import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { logger } from '../config/logger';

export interface ResolutionProfile {
  width: number;
  height: number;
  bitrate: string; // e.g. '8M' for 1080p, '20M' for 4K
  audioBitrate: string; // e.g. '192k', '320k'
  fps: number;
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type QualityResolution = '720p' | '1080p' | '4K';

export class FFmpegService {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    try {
      // Set binary paths from static installer packages if not set in PATH
      if (ffmpegInstaller.path) {
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
        logger.info(`[FFmpegService] FFmpeg binary set: ${ffmpegInstaller.path}`);
      }
      if (ffprobeInstaller.path) {
        ffmpeg.setFfprobePath(ffprobeInstaller.path);
        logger.info(`[FFmpegService] FFprobe binary set: ${ffprobeInstaller.path}`);
      }

      this.initialized = true;
    } catch (err) {
      logger.warn('[FFmpegService] Failed to configure static FFmpeg path:', (err as Error).message);
    }
  }

  /**
   * Get resolution dimensions and encoding settings per aspect ratio and quality preset.
   */
  static getProfile(aspectRatio: AspectRatio = '16:9', resolution: QualityResolution = '1080p'): ResolutionProfile {
    const fps = 30;

    if (aspectRatio === '9:16') {
      // YouTube Shorts / TikTok / Reels
      switch (resolution) {
        case '4K':
          return { width: 2160, height: 3840, bitrate: '18M', audioBitrate: '320k', fps };
        case '720p':
          return { width: 720, height: 1280, bitrate: '3M', audioBitrate: '128k', fps };
        case '1080p':
        default:
          return { width: 1080, height: 1920, bitrate: '8M', audioBitrate: '192k', fps };
      }
    }

    if (aspectRatio === '1:1') {
      // Instagram / Square
      switch (resolution) {
        case '4K':
          return { width: 2160, height: 2160, bitrate: '16M', audioBitrate: '320k', fps };
        case '720p':
          return { width: 720, height: 720, bitrate: '2.5M', audioBitrate: '128k', fps };
        case '1080p':
        default:
          return { width: 1080, height: 1080, bitrate: '6M', audioBitrate: '192k', fps };
      }
    }

    if (aspectRatio === '4:3') {
      // Standard 4:3
      switch (resolution) {
        case '4K':
          return { width: 2880, height: 2160, bitrate: '18M', audioBitrate: '320k', fps };
        case '720p':
          return { width: 960, height: 720, bitrate: '3M', audioBitrate: '128k', fps };
        case '1080p':
        default:
          return { width: 1440, height: 1080, bitrate: '8M', audioBitrate: '192k', fps };
      }
    }

    // Default 16:9 Landscape
    switch (resolution) {
      case '4K':
        return { width: 3840, height: 2160, bitrate: '25M', audioBitrate: '320k', fps };
      case '720p':
        return { width: 1280, height: 720, bitrate: '4M', audioBitrate: '128k', fps };
      case '1080p':
      default:
        return { width: 1920, height: 1080, bitrate: '10M', audioBitrate: '192k', fps };
    }
  }
}

// Auto-initialize on module load
FFmpegService.initialize();
