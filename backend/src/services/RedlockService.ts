import Redlock from 'redlock';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';

export type Lock = Awaited<ReturnType<Redlock['acquire']>>;

let redlockInstance: Redlock | null = null;

function isRedisReady(): boolean {
  try {
    return getIORedisClient().status === 'ready';
  } catch {
    return false;
  }
}

function getRedlock(): Redlock {
  if (!redlockInstance) {
    const redis = getIORedisClient();
    redlockInstance = new Redlock([redis as any], {
      driftFactor: 0.01,
      retryCount: 1, // Only 1 attempt if offline
      retryDelay: 100,
      retryJitter: 50,
      automaticExtensionThreshold: 500,
    });

    redlockInstance.on('error', (err) => {
      if (err.name !== 'LockError') {
        logger.debug('[Redlock] Lock error:', err.message);
      }
    });
  }
  return redlockInstance;
}

/**
 * RedlockService — distributed mutual exclusion using Redis.
 * If Redis is offline, lock checks return a no-op dummy lock.
 */
export class RedlockService {
  async acquireLock(resource: string, ttlMs = 5 * 60 * 1000): Promise<Lock | null> {
    if (!isRedisReady()) {
      // Dummy lock when Redis is offline
      return { release: async () => {} } as unknown as Lock;
    }

    try {
      const lock = await getRedlock().acquire([`lock:${resource}`], ttlMs);
      logger.debug(`[Redlock] Acquired lock: ${resource}`);
      return lock;
    } catch (err) {
      logger.warn(`[Redlock] Lock skipped: ${resource} — ${(err as Error).message}`);
      // If lock failed due to Redis connection issue, allow execution
      return { release: async () => {} } as unknown as Lock;
    }
  }

  async releaseLock(lock: Lock | null): Promise<void> {
    if (!lock) return;
    try {
      await lock.release();
    } catch {
      // Ignore release errors
    }
  }

  async withLock<T>(
    resource: string,
    fn: () => Promise<T>,
    ttlMs = 5 * 60 * 1000
  ): Promise<T> {
    const lock = await this.acquireLock(resource, ttlMs);
    try {
      return await fn();
    } finally {
      await this.releaseLock(lock);
    }
  }
}

export const redlockService = new RedlockService();
