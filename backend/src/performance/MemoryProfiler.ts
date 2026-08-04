import { logger } from '../config/logger';

export interface MemorySnapshot {
  timestamp: string;
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
  leakWarning: boolean;
}

export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];

  takeSnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMb = Math.round(mem.rss / 1024 / 1024);
    const externalMb = Math.round(mem.external / 1024 / 1024);

    const prev = this.snapshots[this.snapshots.length - 1];
    const leakWarning = Boolean(prev && heapUsedMb > prev.heapUsedMb + 200);

    const snap: MemorySnapshot = {
      timestamp: new Date().toISOString(),
      heapUsedMb,
      heapTotalMb,
      rssMb,
      externalMb,
      leakWarning,
    };

    this.snapshots.push(snap);
    if (this.snapshots.length > 1000) this.snapshots.shift();

    if (leakWarning) {
      logger.warn(`[MemoryProfiler] ⚠️ Memory leak warning: heap expanded by >200MB (${heapUsedMb}MB used)`);
    }

    return snap;
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }
}

export const memoryProfiler = new MemoryProfiler();
