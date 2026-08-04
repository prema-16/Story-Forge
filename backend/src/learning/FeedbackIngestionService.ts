import { logger } from '../config/logger';

export interface UserFeedback {
  id: string;
  userId: string;
  projectId?: string;
  promptId?: string;
  type: 'thumbs_up' | 'thumbs_down' | 'rating' | 'text';
  rating?: number; // 1-5
  comment?: string;
  context: Record<string, unknown>;
  timestamp: string;
}

export interface ABExperiment {
  id: string;
  name: string;
  variants: string[];
  trafficSplit: number[]; // must sum to 100
  active: boolean;
  startedAt: string;
  endedAt?: string;
  winner?: string;
}

export class FeedbackIngestionService {
  private feedback: UserFeedback[] = [];
  private experiments: ABExperiment[] = [];

  ingestFeedback(
    userId: string,
    type: UserFeedback['type'],
    context: Record<string, unknown>,
    rating?: number,
    comment?: string,
    projectId?: string
  ): UserFeedback {
    const fb: UserFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId, type, rating, comment, projectId, context,
      timestamp: new Date().toISOString(),
    };
    this.feedback.push(fb);
    logger.info(`[FeedbackIngestionService] Feedback ingested: type=${type}, user=${userId}, rating=${rating || 'N/A'}`);
    return fb;
  }

  createABExperiment(name: string, variants: string[], trafficSplit: number[]): ABExperiment {
    if (trafficSplit.reduce((a, b) => a + b, 0) !== 100) {
      throw new Error('Traffic split must sum to 100');
    }
    const exp: ABExperiment = {
      id: `ab_${Date.now()}`,
      name, variants, trafficSplit, active: true,
      startedAt: new Date().toISOString(),
    };
    this.experiments.push(exp);
    logger.info(`[FeedbackIngestionService] A/B experiment '${name}' created with variants: ${variants.join(' vs ')}`);
    return exp;
  }

  assignVariant(experimentId: string, userId: string): string {
    const exp = this.experiments.find((e) => e.id === experimentId && e.active);
    if (!exp) throw new Error(`Experiment ${experimentId} not found or inactive`);

    const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
    let cumulative = 0;
    for (let i = 0; i < exp.variants.length; i++) {
      cumulative += exp.trafficSplit[i];
      if (hash < cumulative) return exp.variants[i];
    }
    return exp.variants[exp.variants.length - 1];
  }

  concludeExperiment(experimentId: string, winner: string): ABExperiment | undefined {
    const exp = this.experiments.find((e) => e.id === experimentId);
    if (exp) {
      exp.active = false;
      exp.winner = winner;
      exp.endedAt = new Date().toISOString();
      logger.info(`[FeedbackIngestionService] A/B experiment '${exp.name}' concluded — winner: ${winner}`);
    }
    return exp;
  }

  getFeedbackSummary(userId?: string): Record<string, unknown> {
    const data = userId ? this.feedback.filter((f) => f.userId === userId) : this.feedback;
    const thumbsUp = data.filter((f) => f.type === 'thumbs_up').length;
    const thumbsDown = data.filter((f) => f.type === 'thumbs_down').length;
    const ratings = data.filter((f) => f.rating).map((f) => f.rating!);
    const avgRating = ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : null;

    return { total: data.length, thumbsUp, thumbsDown, avgRating, sentimentScore: thumbsUp - thumbsDown };
  }
}

export const feedbackIngestionService = new FeedbackIngestionService();
