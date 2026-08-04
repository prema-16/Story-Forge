import IORedis, { Redis } from 'ioredis';
import { execSync } from 'child_process';
import { env } from './env';
import { logger } from './logger';

let ioRedisClient: Redis | null = null;
let hasLoggedRedisError = false;
let redisStatus: 'connected' | 'offline' | 'reconnecting' = 'offline';

export function getIORedisClient(): Redis {
  if (ioRedisClient) return ioRedisClient;

  ioRedisClient = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      redisStatus = 'reconnecting';
      const delay = Math.min(times * 1000, 10000);
      logger.info(`[Redis] Retrying Connection in ${delay}ms (Attempt ${times})...`);
      return delay;
    },
  });

  ioRedisClient.on('connect', () => {
    hasLoggedRedisError = false;
    redisStatus = 'connected';
    logger.info('✅ Redis (ioredis) connected successfully');
  });

  ioRedisClient.on('error', (err: any) => {
    redisStatus = 'offline';
    if (!hasLoggedRedisError) {
      logger.warn(`
================================================================
⚠️ REDIS CONNECTION WARNING (${env.REDIS_URL})
----------------------------------------------------------------
Status: Redis Offline
Video Generation Disabled: Queues Degraded
Retrying Connection: Exponential Backoff Active
Reason: ${err.message}

Please ensure Redis is running using one of the following methods:
1. Docker: Run 'docker compose up -d redis'
2. Local: Start Redis server on port 6379
3. Config: Verify REDIS_URL in your .env file
================================================================
      `);
      hasLoggedRedisError = true;
    }
  });

  return ioRedisClient;
}

export function getRedisCurrentStatus(): { status: 'connected' | 'offline' | 'reconnecting'; message: string } {
  if (redisStatus === 'connected') {
    return { status: 'connected', message: 'Redis Connected' };
  } else if (redisStatus === 'reconnecting') {
    return { status: 'reconnecting', message: 'Retrying Connection' };
  } else {
    return { status: 'offline', message: 'Redis Offline — Video Generation Disabled' };
  }
}

export async function autoStartRedisViaDocker(): Promise<boolean> {
  try {
    logger.info('🔍 Checking if Docker can auto-start Redis...');
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker compose up -d redis', { stdio: 'ignore' });
    logger.info('🚀 Triggered "docker compose up -d redis" successfully.');
    return true;
  } catch {
    logger.warn('⚠️ Docker is not available or failed to start Redis container.');
    return false;
  }
}

export async function checkRedisWithBackoff(maxRetries = 3, delayMs = 2000): Promise<boolean> {
  const client = getIORedisClient();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Checking Redis connection (Attempt ${attempt}/${maxRetries})...`);
      if (client.status === 'wait' || client.status === 'close') {
        await client.connect();
      }
      await client.ping();
      redisStatus = 'connected';
      logger.info('✓ Redis Connected');
      return true;
    } catch (err: any) {
      redisStatus = 'offline';
      logger.warn(`Redis check failed on attempt ${attempt}: ${err.message}`);
      if (attempt === 1) {
        await autoStartRedisViaDocker();
      }
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  return false;
}

export async function disconnectRedis(): Promise<void> {
  if (ioRedisClient) {
    await ioRedisClient.quit();
    ioRedisClient = null;
    redisStatus = 'offline';
  }
}
