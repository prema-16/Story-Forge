import { logger } from '../config/logger';

export interface RenderWorkerNode {
  id: string;
  host: string;
  type: 'gpu' | 'cpu';
  gpuModel?: string;
  activeJobs: number;
  maxConcurrency: number;
  cpuUtilization: number;
  memoryUtilization: number;
  status: 'healthy' | 'busy' | 'offline';
  lastHeartbeat: string;
}

export class RenderFarmScheduler {
  private workers = new Map<string, RenderWorkerNode>();

  constructor() {
    // Register default worker nodes
    this.registerWorker({
      id: 'worker-gpu-01',
      host: 'node-gpu-east.storyforge.ai',
      type: 'gpu',
      gpuModel: 'NVIDIA RTX 4090 (24GB VRAM)',
      activeJobs: 1,
      maxConcurrency: 4,
      cpuUtilization: 35,
      memoryUtilization: 42,
      status: 'healthy',
      lastHeartbeat: new Date().toISOString(),
    });

    this.registerWorker({
      id: 'worker-cpu-01',
      host: 'node-cpu-central.storyforge.ai',
      type: 'cpu',
      activeJobs: 2,
      maxConcurrency: 8,
      cpuUtilization: 68,
      memoryUtilization: 55,
      status: 'healthy',
      lastHeartbeat: new Date().toISOString(),
    });

    logger.info(`[RenderFarmScheduler] Initialized render farm with ${this.workers.size} registered worker nodes`);
  }

  registerWorker(node: RenderWorkerNode): void {
    this.workers.set(node.id, node);
    logger.info(`[RenderFarmScheduler] Registered worker node '${node.id}' (${node.type.toUpperCase()})`);
  }

  /**
   * Schedule job to best available worker node based on GPU requirements and current load.
   */
  scheduleJob(requireGPU = false): RenderWorkerNode | null {
    const candidates = Array.from(this.workers.values()).filter(
      (w) => w.status !== 'offline' && w.activeJobs < w.maxConcurrency
    );

    if (candidates.length === 0) return null;

    if (requireGPU) {
      const gpuWorker = candidates.find((w) => w.type === 'gpu');
      if (gpuWorker) return gpuWorker;
    }

    // Sort by lowest active jobs & lowest CPU utilization
    candidates.sort((a, b) => a.activeJobs / a.maxConcurrency - b.activeJobs / b.maxConcurrency);

    return candidates[0];
  }

  getWorkerMetrics(): RenderWorkerNode[] {
    return Array.from(this.workers.values());
  }
}

export const renderFarmScheduler = new RenderFarmScheduler();
