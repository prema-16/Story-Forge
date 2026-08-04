import { logger } from '../config/logger';

export interface ReviewItem {
  id: string;
  promptId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export class HumanReviewQueue {
  private queue: ReviewItem[] = [];

  enqueue(promptId: string, reason: string): ReviewItem {
    const item: ReviewItem = {
      id: `rev_${Date.now()}`,
      promptId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.queue.push(item);
    logger.warn(`[HumanReviewQueue] Enqueued item for human review: ${promptId} (${reason})`);
    return item;
  }

  getPending(): ReviewItem[] {
    return this.queue.filter((i) => i.status === 'pending');
  }

  resolve(id: string, status: 'approved' | 'rejected'): boolean {
    const item = this.queue.find((i) => i.id === id);
    if (!item) return false;
    item.status = status;
    logger.info(`[HumanReviewQueue] Review item ${id} resolved: ${status}`);
    return true;
  }
}

export const humanReviewQueue = new HumanReviewQueue();
