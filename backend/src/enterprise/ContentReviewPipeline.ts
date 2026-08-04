import { logger } from '../config/logger';

export type ReviewGate = 'legal' | 'brand' | 'publishing';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface ReviewRequest {
  id: string;
  projectId: string;
  gate: ReviewGate;
  reviewerId?: string;
  status: ReviewStatus;
  notes?: string;
  updatedAt: string;
}

export class ContentReviewPipeline {
  private reviews = new Map<string, ReviewRequest[]>(); // projectId -> ReviewRequest[]

  submitForReview(projectId: string, gates: ReviewGate[] = ['brand', 'legal', 'publishing']): ReviewRequest[] {
    const requests: ReviewRequest[] = gates.map((gate) => ({
      id: `rev_${gate}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      gate,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    }));

    this.reviews.set(projectId, requests);
    logger.info(`[ContentReviewPipeline] Project '${projectId}' submitted to review pipeline (${gates.join(', ')})`);
    return requests;
  }

  updateReviewStatus(
    projectId: string,
    gate: ReviewGate,
    status: ReviewStatus,
    reviewerId?: string,
    notes?: string
  ): boolean {
    const list = this.reviews.get(projectId);
    if (!list) return false;

    const item = list.find((r) => r.gate === gate);
    if (item) {
      item.status = status;
      if (reviewerId) item.reviewerId = reviewerId;
      if (notes) item.notes = notes;
      item.updatedAt = new Date().toISOString();
      logger.info(`[ContentReviewPipeline] Updated review gate '${gate}' for project '${projectId}' to ${status.toUpperCase()}`);
      return true;
    }
    return false;
  }

  getReviewStatus(projectId: string): ReviewRequest[] {
    return this.reviews.get(projectId) || [];
  }

  isFullyApproved(projectId: string): boolean {
    const list = this.reviews.get(projectId);
    if (!list || list.length === 0) return false;
    return list.every((r) => r.status === 'approved');
  }

  resetReviewPipeline(projectId: string): void {
    this.reviews.delete(projectId);
    logger.info(`[ContentReviewPipeline] Reset review pipeline for project '${projectId}'`);
  }
}

export const contentReviewPipeline = new ContentReviewPipeline();

