import { BaseRepository } from '../../repositories/base.repository';
import { Session, ISession } from '../../models/Session';

export class SessionsRepository extends BaseRepository<ISession> {
  constructor() {
    super(Session);
  }

  async findByTokenId(tokenId: string): Promise<ISession | null> {
    return this.model.findOne({ tokenId, isRevoked: false }).select('+refreshTokenHash').exec();
  }

  async findActiveByUserId(userId: string): Promise<ISession[]> {
    return this.model.find({ userId, isRevoked: false, expiresAt: { $gt: new Date() } }).sort({ lastActiveAt: -1 }).exec();
  }

  async revokeSession(tokenId: string): Promise<boolean> {
    const result = await this.model.updateOne({ tokenId }, { $set: { isRevoked: true } }).exec();
    return result.modifiedCount > 0;
  }

  async revokeAllUserSessions(userId: string, exceptTokenId?: string): Promise<number> {
    const filter: Record<string, unknown> = { userId, isRevoked: false };
    if (exceptTokenId) filter.tokenId = { $ne: exceptTokenId };
    const result = await this.model.updateMany(filter, { $set: { isRevoked: true } }).exec();
    return result.modifiedCount;
  }

  async touchLastActive(tokenId: string): Promise<void> {
    await this.model.updateOne({ tokenId }, { $set: { lastActiveAt: new Date() } }).exec();
  }
}

export const sessionsRepository = new SessionsRepository();
