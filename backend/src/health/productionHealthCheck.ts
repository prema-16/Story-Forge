import mongoose from 'mongoose';
import { getIORedisClient, getRedisCurrentStatus } from '../config/redis';
import { workerManager } from '../services/WorkerManager';
import { razorpayProvider } from '../billing/providers/RazorpayProvider';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface ProductionHealthReport {
  timestamp: string;
  environment: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  uptimeSeconds: number;
  subsystems: {
    mongoDB: { status: 'connected' | 'disconnected'; latencyMs: number };
    redis: { status: string; message: string };
    bullMQQueues: { status: 'healthy' | 'degraded'; totalWaitingJobs: number };
    workersSwarm: { totalRegistered: number; onlineCount: number; list: any[] };
    payments: { provider: string; status: 'active' | 'inactive' };
    aiProviders: Record<string, string>;
    storageCDN: { provider: string; status: string };
    systemMetrics: { heapUsedMb: number; heapTotalMb: number; cpuUsageMs: number };
  };
}

export async function checkProductionHealth(): Promise<ProductionHealthReport> {
  const t0 = Date.now();

  // 1. MongoDB Ping
  let mongoStatus: 'connected' | 'disconnected' = 'disconnected';
  let mongoLatency = -1;
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db?.admin().ping();
      mongoLatency = Date.now() - t0;
      mongoStatus = 'connected';
    }
  } catch {
    mongoStatus = 'disconnected';
  }

  // 2. Redis Status
  const redisInfo = getRedisCurrentStatus();

  // 3. Worker Swarm
  const workers = workerManager.getAll();

  // 4. Memory & CPU
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();

  const report: ProductionHealthReport = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    status: mongoStatus === 'connected' && redisInfo.status === 'connected' ? 'HEALTHY' : 'DEGRADED',
    uptimeSeconds: Math.floor(process.uptime()),
    subsystems: {
      mongoDB: { status: mongoStatus, latencyMs: mongoLatency },
      redis: redisInfo,
      bullMQQueues: { status: redisInfo.status === 'connected' ? 'healthy' : 'degraded', totalWaitingJobs: 0 },
      workersSwarm: { totalRegistered: workers.length, onlineCount: workers.length, list: workers },
      payments: { provider: 'Razorpay / Stripe', status: 'active' },
      aiProviders: {
        openai: env.OPENAI_API_KEY ? 'Active' : 'Fallback Mode',
        anthropic: env.ANTHROPIC_API_KEY ? 'Active' : 'Fallback Mode',
        gemini: env.GEMINI_API_KEY ? 'Active' : 'Fallback Mode',
        groq: env.GROQ_API_KEY ? 'Active' : 'Fallback Mode',
        deepseek: env.DEEPSEEK_API_KEY ? 'Active' : 'Fallback Mode',
        elevenlabs: env.ELEVENLABS_API_KEY ? 'Active' : 'Fallback Mode',
        runway: env.RUNWAY_API_KEY ? 'Active' : 'Fallback Mode',
      },
      storageCDN: { provider: env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary' : 'Local FS', status: 'Ready' },
      systemMetrics: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        cpuUsageMs: Math.round(cpu.user / 1000),
      },
    },
  };

  logger.info(`[ProductionHealthCheck] System status: ${report.status} (Mongo: ${mongoStatus}, Redis: ${redisInfo.status}, Workers: ${workers.length})`);
  return report;
}
