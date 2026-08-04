import { Response } from 'express';
import { logger } from '../../config/logger';

export interface StreamEvent {
  type: 'token' | 'progress' | 'log' | 'metric' | 'cost' | 'heartbeat';
  projectId: string;
  stepId?: string;
  data: unknown;
  timestamp: string;
}

export class StreamingEngine {
  private activeStreams = new Map<string, Set<Response>>();

  registerClient(projectId: string, res: Response): () => void {
    if (!this.activeStreams.has(projectId)) {
      this.activeStreams.set(projectId, new Set());
    }
    this.activeStreams.get(projectId)!.add(res);

    // Initial connected event
    this.sendEventToResponse(res, {
      type: 'progress',
      projectId,
      data: { message: 'SSE Stream connected' },
      timestamp: new Date().toISOString(),
    });

    return () => {
      this.activeStreams.get(projectId)?.delete(res);
      logger.debug(`[StreamingEngine] Client disconnected from project ${projectId}`);
    };
  }

  broadcast(projectId: string, event: Omit<StreamEvent, 'timestamp'>): void {
    const clients = this.activeStreams.get(projectId);
    if (!clients || clients.size === 0) return;

    const fullEvent: StreamEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    clients.forEach((res) => this.sendEventToResponse(res, fullEvent));
  }

  private sendEventToResponse(res: Response, event: StreamEvent): void {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (err) {
      logger.warn('[StreamingEngine] Failed to write to SSE client response');
    }
  }
}

export const streamingEngine = new StreamingEngine();
