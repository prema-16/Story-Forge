import { SessionsRepository, sessionsRepository } from './sessions.repository';
import { auditRepository } from '../audit/audit.repository';
import type { SessionDetail } from '@storyforge/shared';

export class SessionsService {
  constructor(private readonly sessionsRepo: SessionsRepository = sessionsRepository) {}

  async getUserSessions(userId: string, currentTokenId?: string): Promise<SessionDetail[]> {
    const sessions = await this.sessionsRepo.findActiveByUserId(userId);

    return sessions.map((s) => ({
      tokenId: s.tokenId,
      userId: s.userId.toString(),
      userAgent: s.userAgent,
      browser: s.browser,
      os: s.os,
      device: s.device,
      ip: s.ip,
      location: s.location,
      isCurrentSession: s.tokenId === currentTokenId,
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastActiveAt.toISOString(),
    }));
  }

  async revokeSession(userId: string, tokenId: string): Promise<boolean> {
    const success = await this.sessionsRepo.revokeSession(tokenId);
    if (success) {
      await auditRepository.logEvent({
        userId,
        action: 'user.logout',
        metadata: { revokedTokenId: tokenId },
      });
    }
    return success;
  }

  async revokeAllSessions(userId: string, currentTokenId?: string): Promise<number> {
    const count = await this.sessionsRepo.revokeAllUserSessions(userId, currentTokenId);
    await auditRepository.logEvent({
      userId,
      action: 'user.logout_all',
      metadata: { revokedCount: count },
    });
    return count;
  }
}

export const sessionsService = new SessionsService();
