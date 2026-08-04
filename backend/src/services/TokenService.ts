import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

const TOKEN_PREFIX = 'refresh:';
const SESSION_PREFIX = 'session:';

export interface SessionInfo {
  tokenId: string;
  userId: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastUsedAt: string;
}

/**
 * TokenService — enterprise-grade refresh token management.
 * Tokens are stored as bcrypt hashes in Redis with 30-day TTL.
 * If Redis is offline/unreachable, operations degrade gracefully without hanging.
 */
class TokenService {
  private readonly TTL = 30 * 24 * 60 * 60; // 30 days in seconds

  private isRedisReady(): boolean {
    try {
      const redis = getIORedisClient();
      return redis.status === 'ready';
    } catch {
      return false;
    }
  }

  generateTokenId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store a refresh token hash in Redis.
   * If Redis is not connected, fails silently to allow login to proceed.
   */
  async storeRefreshToken(
    userId: string,
    rawToken: string,
    userAgent: string,
    ip: string
  ): Promise<string> {
    const tokenId = this.generateTokenId();

    if (!this.isRedisReady()) {
      logger.debug('[TokenService] Redis not ready — skipping refresh token persistence');
      return tokenId;
    }

    try {
      const redis = getIORedisClient();
      const hash = await bcrypt.hash(rawToken, 10);

      const sessionData: SessionInfo = {
        tokenId,
        userId,
        userAgent: userAgent || 'Unknown',
        ip: ip || 'Unknown',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      const pipeline = redis.pipeline();
      pipeline.setex(`${TOKEN_PREFIX}${userId}:${tokenId}`, this.TTL, hash);
      pipeline.setex(`${SESSION_PREFIX}${userId}:${tokenId}`, this.TTL, JSON.stringify(sessionData));
      pipeline.sadd(`sessions:${userId}`, tokenId);
      pipeline.expire(`sessions:${userId}`, this.TTL);
      await pipeline.exec();

      logger.debug(`[TokenService] Stored refresh token ${tokenId} for user ${userId}`);
    } catch (err) {
      logger.warn('[TokenService] Redis store failed:', (err as Error).message);
    }

    return tokenId;
  }

  /**
   * Validate a refresh token.
   * If Redis is offline, returns true to avoid locking users out.
   */
  async validateRefreshToken(
    userId: string,
    tokenId: string,
    rawToken: string
  ): Promise<boolean> {
    if (!this.isRedisReady()) return true;

    try {
      const redis = getIORedisClient();
      const key = `${TOKEN_PREFIX}${userId}:${tokenId}`;
      const storedHash = await redis.get(key);

      if (!storedHash) return false;

      const isValid = await bcrypt.compare(rawToken, storedHash);

      if (isValid) {
        const sessionKey = `${SESSION_PREFIX}${userId}:${tokenId}`;
        const raw = await redis.get(sessionKey);
        if (raw) {
          const session: SessionInfo = JSON.parse(raw);
          session.lastUsedAt = new Date().toISOString();
          await redis.setex(sessionKey, this.TTL, JSON.stringify(session));
        }
      }

      return isValid;
    } catch {
      return true; // Fallback gracefully if Redis errors during lookup
    }
  }

  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    if (!this.isRedisReady()) return;
    try {
      const redis = getIORedisClient();
      const pipeline = redis.pipeline();
      pipeline.del(`${TOKEN_PREFIX}${userId}:${tokenId}`);
      pipeline.del(`${SESSION_PREFIX}${userId}:${tokenId}`);
      pipeline.srem(`sessions:${userId}`, tokenId);
      await pipeline.exec();
    } catch {}
  }

  async revokeAllTokens(userId: string): Promise<void> {
    if (!this.isRedisReady()) return;
    try {
      const redis = getIORedisClient();
      const tokenIds = await redis.smembers(`sessions:${userId}`);
      if (tokenIds.length === 0) return;

      const pipeline = redis.pipeline();
      for (const tokenId of tokenIds) {
        pipeline.del(`${TOKEN_PREFIX}${userId}:${tokenId}`);
        pipeline.del(`${SESSION_PREFIX}${userId}:${tokenId}`);
      }
      pipeline.del(`sessions:${userId}`);
      await pipeline.exec();
    } catch {}
  }

  async listSessions(userId: string): Promise<SessionInfo[]> {
    if (!this.isRedisReady()) return [];
    try {
      const redis = getIORedisClient();
      const tokenIds = await redis.smembers(`sessions:${userId}`);
      const sessions: SessionInfo[] = [];

      for (const tokenId of tokenIds) {
        const raw = await redis.get(`${SESSION_PREFIX}${userId}:${tokenId}`);
        if (raw) sessions.push(JSON.parse(raw));
      }

      return sessions.sort(
        (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      );
    } catch {
      return [];
    }
  }

  async blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void> {
    if (!this.isRedisReady()) return;
    try {
      const redis = getIORedisClient();
      await redis.setex(`blacklist:${jti}`, ttlSeconds, '1');
    } catch {}
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    if (!this.isRedisReady()) return false;
    try {
      const redis = getIORedisClient();
      const val = await redis.get(`blacklist:${jti}`);
      return val === '1';
    } catch {
      return false;
    }
  }
}

export const tokenService = new TokenService();
