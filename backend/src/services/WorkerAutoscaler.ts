import os from 'os';
import { Worker } from 'bullmq';
import { logger } from '../config/logger';

export interface AutoscalerOptions {
  minConcurrency: number;
  maxConcurrency: number;
  checkIntervalMs?: number;
  memoryThresholdPercent?: number; // scale down if system RAM exceeds threshold
}

export class WorkerAutoscaler {
  private timer: NodeJS.Timeout | null = null;
  private currentConcurrency: number;

  constructor(
    private worker: Worker,
    private name: string,
    private options: AutoscalerOptions
  ) {
    this.currentConcurrency = options.minConcurrency;
  }

  start(): void {
    const interval = this.options.checkIntervalMs || 30000;
    this.timer = setInterval(() => this.evaluateLoad(), interval);
    logger.info(`[Autoscaler] Monitoring started for worker "${this.name}" (${this.options.minConcurrency}-${this.options.maxConcurrency} concurrency)`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private evaluateLoad(): void {
    try {
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;
      const memLimit = this.options.memoryThresholdPercent || 85;

      let targetConcurrency = this.currentConcurrency;

      if (usedMemPercent > memLimit) {
        // High memory pressure — scale down
        targetConcurrency = Math.max(this.options.minConcurrency, this.currentConcurrency - 1);
        if (targetConcurrency !== this.currentConcurrency) {
          logger.warn(`[Autoscaler] High memory usage (${usedMemPercent.toFixed(1)}%) — scaling down "${this.name}" concurrency to ${targetConcurrency}`);
        }
      } else {
        // Normal memory — check CPU load average
        const loadAvg = os.loadavg()[0]; // 1 min load average
        const cpus = os.cpus().length;

        if (loadAvg < cpus * 0.7 && this.currentConcurrency < this.options.maxConcurrency) {
          targetConcurrency = Math.min(this.options.maxConcurrency, this.currentConcurrency + 1);
          logger.info(`[Autoscaler] Low system load — scaling up "${this.name}" concurrency to ${targetConcurrency}`);
        }
      }

      if (targetConcurrency !== this.currentConcurrency) {
        this.currentConcurrency = targetConcurrency;
        // Adjust worker concurrency dynamically
        (this.worker as any).concurrency = targetConcurrency;
      }
    } catch (err) {
      logger.debug('[Autoscaler] Evaluation error:', (err as Error).message);
    }
  }

  getConcurrency(): number {
    return this.currentConcurrency;
  }
}
