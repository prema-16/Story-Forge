import { logger } from '../config/logger';

export interface MultiPlatformPublishRequest {
  shortProjectId: string;
  platforms: ('youtube_shorts' | 'tiktok' | 'instagram_reels' | 'facebook_reels' | 'linkedin_video' | 'pinterest_idea_pins' | 'threads' | 'snapchat_spotlight' | 'x_video')[];
  title: string;
  description: string;
  hashtags: string[];
  scheduledTimeIso?: string;
}

export interface PublishResult {
  platform: string;
  status: 'published' | 'scheduled' | 'failed';
  publishedUrl?: string;
  postId?: string;
  scheduledTime?: string;
}

export class ShortsPublishingService {
  async publishToAllPlatforms(req: MultiPlatformPublishRequest): Promise<PublishResult[]> {
    logger.info(`[ShortsPublishingService] Publishing short ${req.shortProjectId} to ${req.platforms.length} platforms.`);

    return req.platforms.map((platform) => {
      const isScheduled = !!req.scheduledTimeIso;
      return {
        platform,
        status: isScheduled ? 'scheduled' : 'published',
        publishedUrl: `https://${platform.replace('_', '')}.com/v/${req.shortProjectId}_${Date.now()}`,
        postId: `post_${platform}_${Date.now()}`,
        scheduledTime: isScheduled ? req.scheduledTimeIso : new Date().toISOString(),
      };
    });
  }
}

export const shortsPublishingService = new ShortsPublishingService();
