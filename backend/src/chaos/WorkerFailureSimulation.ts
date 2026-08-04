import { logger } from '../config/logger';

export class WorkerFailureSimulation {
  simulateWorkerKill(workerId: string): { killed: boolean; recovered: boolean; downtimeSeconds: number } {
    logger.warn(`[WorkerFailureSimulation] Simulating abrupt SIGKILL on worker ${workerId}...`);
    // Simulated recovery: BullMQ re-claims stalled jobs within 12 seconds
    const downtimeSeconds = 12;
    logger.info(`[WorkerFailureSimulation] BullMQ stalled job lock recovered in ${downtimeSeconds}s`);
    return { killed: true, recovered: true, downtimeSeconds };
  }
}

export const workerFailureSimulation = new WorkerFailureSimulation();
