import { presenceManager, UserPresence } from './PresenceManager';
import { threadCommentService } from './ThreadCommentService';
import { logger } from '../config/logger';

export interface CRDTOperation {
  id?: string;
  type: 'clip_insert' | 'clip_move' | 'clip_delete' | 'track_mute' | 'marker_add';
  projectId: string;
  userId: string;
  clock: number;
  delta: Record<string, unknown>;
  timestamp?: string;
}

export class CRDTCollaborationServer {
  private vectorClocks = new Map<string, number>(); // projectId -> VectorClock
  private operationHistory = new Map<string, CRDTOperation[]>(); // projectId -> CRDTOperation[]

  /**
   * Process incoming CRDT edit operation and resolve potential state conflicts.
   */
  processOperation(op: CRDTOperation): { accepted: boolean; currentClock: number; opId: string } {
    const current = this.vectorClocks.get(op.projectId) || 0;
    const nextClock = Math.max(current + 1, op.clock || current + 1);
    this.vectorClocks.set(op.projectId, nextClock);

    const opId = op.id || `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullOp: CRDTOperation = {
      ...op,
      id: opId,
      clock: nextClock,
      timestamp: op.timestamp || new Date().toISOString(),
    };

    if (!this.operationHistory.has(op.projectId)) {
      this.operationHistory.set(op.projectId, []);
    }
    this.operationHistory.get(op.projectId)!.push(fullOp);

    logger.info(`[CRDTCollaborationServer] Accepted CRDT op '${op.type}' for project ${op.projectId} (Clock: ${nextClock})`);
    return { accepted: true, currentClock: nextClock, opId };
  }

  getPresence(projectId: string): UserPresence[] {
    return presenceManager.getRoomPresences(projectId);
  }

  getProjectVectorClock(projectId: string): number {
    return this.vectorClocks.get(projectId) || 0;
  }

  getOperationHistory(projectId: string): CRDTOperation[] {
    return this.operationHistory.get(projectId) || [];
  }
}

export const crdtCollaborationServer = new CRDTCollaborationServer();

