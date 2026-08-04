import { logger } from '../config/logger';

export interface UserPresence {
  userId: string;
  userName: string;
  avatar?: string;
  color: string;
  cursorPosition?: { x: number; y: number; timecode?: number };
  selection?: { trackId: string; clipId: string };
  lastActive: string;
}

export class PresenceManager {
  private activePresences = new Map<string, Map<string, UserPresence>>(); // roomId -> (userId -> UserPresence)

  setUserPresence(roomId: string, presence: UserPresence): void {
    if (!this.activePresences.has(roomId)) {
      this.activePresences.set(roomId, new Map());
    }
    this.activePresences.get(roomId)!.set(presence.userId, {
      ...presence,
      lastActive: new Date().toISOString(),
    });
    logger.debug(`[PresenceManager] Updated presence for user '${presence.userName}' in room '${roomId}'`);
  }

  removeUserPresence(roomId: string, userId: string): void {
    const room = this.activePresences.get(roomId);
    if (room) {
      room.delete(userId);
      logger.debug(`[PresenceManager] Removed user '${userId}' from room '${roomId}'`);
    }
  }

  getRoomPresences(roomId: string): UserPresence[] {
    const room = this.activePresences.get(roomId);
    return room ? Array.from(room.values()) : [];
  }

  cleanupStalePresences(roomId: string, maxInactiveMs = 60000): number {
    const room = this.activePresences.get(roomId);
    if (!room) return 0;

    const now = Date.now();
    let removed = 0;
    for (const [userId, presence] of room.entries()) {
      if (now - new Date(presence.lastActive).getTime() > maxInactiveMs) {
        room.delete(userId);
        removed++;
      }
    }
    if (removed > 0) {
      logger.info(`[PresenceManager] Cleaned up ${removed} stale presences in room '${roomId}'`);
    }
    return removed;
  }

  getActiveUsersCount(roomId: string): number {
    return this.activePresences.get(roomId)?.size || 0;
  }
}

export const presenceManager = new PresenceManager();

