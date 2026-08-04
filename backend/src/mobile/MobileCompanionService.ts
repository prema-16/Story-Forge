import { logger } from '../config/logger';
import { contentReviewPipeline } from '../enterprise/ContentReviewPipeline';
import { notificationService } from '../notifications/NotificationService';

export interface MobileSummaryResponse {
  activeRenders: number;
  pendingApprovals: number;
  unreadNotifications: number;
  quickStats: {
    monthlyViews: string;
    totalPublished: number;
  };
}

export class MobileCompanionService {
  getMobileSummary(userId: string): MobileSummaryResponse {
    logger.info(`[MobileCompanionService] Fetched mobile dashboard summary for user ${userId}`);
    const unread = notificationService.getUnreadNotifications(userId).length;

    return {
      activeRenders: 2,
      pendingApprovals: 1,
      unreadNotifications: unread,
      quickStats: {
        monthlyViews: '1.4M',
        totalPublished: 48,
      },
    };
  }

  approveReviewFromMobile(projectId: string, gate: 'legal' | 'brand' | 'publishing', userId: string): boolean {
    logger.info(`[MobileCompanionService] Mobile approval triggered by ${userId} for project ${projectId} gate ${gate}`);
    return contentReviewPipeline.updateReviewStatus(projectId, gate, 'approved', userId, 'Approved via Mobile Companion App');
  }
}

export const mobileCompanionService = new MobileCompanionService();

