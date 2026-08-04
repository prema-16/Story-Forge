import { Worker } from 'bullmq';
import { logger } from '../config/logger';

export interface WorkerMetadata {
  name: string;
  status: 'online' | 'offline' | 'recovering';
  startedAt: string;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  memoryMb: number;
  cpuPercent: number;
  version: string;
}

export class WorkerManager {
  private static instance: WorkerManager;
  private workers = new Map<string, { worker: Worker; metadata: WorkerMetadata }>();

  private constructor() {}

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  public register(name: string, worker: Worker): void {
    const metadata: WorkerMetadata = {
      name,
      status: 'online',
      startedAt: new Date().toISOString(),
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cpuPercent: 0,
      version: '3.0.0',
    };

    worker.on('active', () => {
      metadata.activeJobs += 1;
    });

    worker.on('completed', () => {
      if (metadata.activeJobs > 0) metadata.activeJobs -= 1;
      metadata.completedJobs += 1;
    });

    worker.on('failed', () => {
      if (metadata.activeJobs > 0) metadata.activeJobs -= 1;
      metadata.failedJobs += 1;
    });

    worker.on('error', (err) => {
      logger.error(`[WorkerManager] Worker ${name} encountered an error:`, err.message);
      metadata.status = 'recovering';
    });

    this.workers.set(name, { worker, metadata });
    logger.info(`✓ ${name} Online`);
  }

  public getAll(): WorkerMetadata[] {
    const list: WorkerMetadata[] = [];
    for (const [_, item] of this.workers) {
      item.metadata.memoryMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      list.push({ ...item.metadata });
    }
    return list;
  }

  public async recoverAll(): Promise<void> {
    logger.info('[WorkerManager] Reconnecting and recovering all registered workers...');
    for (const [name, item] of this.workers) {
      try {
        if (item.worker.isPaused()) {
          await item.worker.resume();
        }
        item.metadata.status = 'online';
        logger.info(`✓ Worker ${name} recovered successfully`);
      } catch (err: any) {
        logger.error(`❌ Worker ${name} recovery failed:`, err.message);
      }
    }
  }

  public async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];
    for (const [name, item] of this.workers) {
      logger.info(`Closing worker ${name}...`);
      closePromises.push(item.worker.close());
    }
    await Promise.all(closePromises);
    this.workers.clear();
  }
}

export const workerManager = WorkerManager.getInstance();
