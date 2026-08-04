import { logger } from '../config/logger';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'webhook';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  read: boolean;
  createdAt: string;
}

export class NotificationService {
  private notifications: NotificationItem[] = [];

  sendNotification(userId: string, title: string, message: string, channel: NotificationChannel = 'in_app'): NotificationItem {
    const item: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title,
      message,
      channel,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(item);
    logger.info(`[NotificationService] Sent ${channel} notification '${title}' to user ${userId}`);
    return item;
  }

  getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  getUnreadNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId && !n.read);
  }

  markAsRead(notificationId: string): boolean {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.read = true;
      logger.info(`[NotificationService] Marked notification '${notificationId}' as read`);
      return true;
    }
    return false;
  }

  clearUserNotifications(userId: string): number {
    const beforeCount = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.userId !== userId);
    const removed = beforeCount - this.notifications.length;
    logger.info(`[NotificationService] Cleared ${removed} notifications for user ${userId}`);
    return removed;
  }
}

export const notificationService = new NotificationService();

