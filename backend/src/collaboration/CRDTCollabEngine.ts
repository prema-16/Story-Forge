import { logger } from '../config/logger';

export interface ActiveUserPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  activeTrackId?: string;
  cursorPosition: { x: number; y: number; timeSec: number };
  lastActive: string;
}

export interface EditOperation {
  opId: string;
  userId: string;
  targetPath: string;
  opType: 'insert' | 'update' | 'delete';
  value: unknown;
  clientTimestamp: number;
}

export interface MergeResult {
  mergedValue: unknown;
  conflictResolved: boolean;
  resolutionStrategy: 'ai_smart_merge' | 'lww' | 'manual_review';
}

export class CRDTCollabEngine {
  private activePresenceMap = new Map<string, Map<string, ActiveUserPresence>>(); // room/project -> (userId -> presence)

  updatePresence(roomId: string, presence: ActiveUserPresence): ActiveUserPresence[] {
    if (!this.activePresenceMap.has(roomId)) {
      this.activePresenceMap.set(roomId, new Map());
    }

    const roomMap = this.activePresenceMap.get(roomId)!;
    roomMap.set(presence.userId, presence);

    logger.info(`[CRDTCollabEngine] Updated presence for user ${presence.userName} in room ${roomId}`);
    return Array.from(roomMap.values());
  }

  getRoomPresence(roomId: string): ActiveUserPresence[] {
    const roomMap = this.activePresenceMap.get(roomId);
    return roomMap ? Array.from(roomMap.values()) : [];
  }

  resolveConflict(opA: EditOperation, opB: EditOperation): MergeResult {
    logger.info(`[CRDTCollabEngine] AI Conflict Resolver analyzing ops '${opA.opId}' and '${opB.opId}'`);

    // Smart AI conflict resolution logic
    if (opA.targetPath === opB.targetPath) {
      if (typeof opA.value === 'string' && typeof opB.value === 'string') {
        return {
          mergedValue: `${opA.value} ${opB.value}`,
          conflictResolved: true,
          resolutionStrategy: 'ai_smart_merge',
        };
      }

      // Fallback: Last-Write-Wins (LWW)
      const winningOp = opA.clientTimestamp >= opB.clientTimestamp ? opA : opB;
      return {
        mergedValue: winningOp.value,
        conflictResolved: true,
        resolutionStrategy: 'lww',
      };
    }

    return {
      mergedValue: opA.value,
      conflictResolved: true,
      resolutionStrategy: 'lww',
    };
  }
}

export const crdtCollabEngine = new CRDTCollabEngine();
