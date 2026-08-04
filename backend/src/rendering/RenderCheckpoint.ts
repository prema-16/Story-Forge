import { logger } from '../config/logger';

export interface RenderFrameCheckpoint {
  jobId: string;
  projectId: string;
  completedScenes: number[];
  lastCompletedFrame: number;
  totalFrames: number;
  snapshotPath: string;
  timestamp: string;
}

export class RenderCheckpointManager {
  private checkpoints = new Map<string, RenderFrameCheckpoint>();

  /**
   * Save a render progress checkpoint.
   */
  saveCheckpoint(checkpoint: Omit<RenderFrameCheckpoint, 'timestamp'>): void {
    const fullCheckpoint: RenderFrameCheckpoint = {
      ...checkpoint,
      timestamp: new Date().toISOString(),
    };
    this.checkpoints.set(checkpoint.jobId, fullCheckpoint);
    logger.debug(`[RenderCheckpoint] Saved checkpoint for job ${checkpoint.jobId}: scene ${checkpoint.completedScenes.length} (${checkpoint.lastCompletedFrame}/${checkpoint.totalFrames} frames)`);
  }

  /**
   * Retrieve last saved checkpoint to resume a failed or interrupted render job.
   */
  getCheckpoint(jobId: string): RenderFrameCheckpoint | null {
    return this.checkpoints.get(jobId) || null;
  }

  /**
   * Clear checkpoint upon successful render completion.
   */
  clearCheckpoint(jobId: string): void {
    this.checkpoints.delete(jobId);
    logger.debug(`[RenderCheckpoint] Cleared checkpoint for job ${jobId}`);
  }
}

export const renderCheckpointManager = new RenderCheckpointManager();
