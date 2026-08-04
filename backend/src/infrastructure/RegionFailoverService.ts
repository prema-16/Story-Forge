import { logger } from '../config/logger';
import { globalDeploymentManager, Region } from './GlobalDeploymentManager';

export interface FailoverEvent {
  timestamp: string;
  fromRegion: Region;
  toRegion: Region;
  reason: string;
  rtoSeconds: number;
}

export class RegionFailoverService {
  private failoverHistory: FailoverEvent[] = [];
  private rtoTargetSeconds = 900; // 15 min RTO target

  async performFailover(failedRegion: Region, reason: string): Promise<FailoverEvent> {
    const start = Date.now();
    logger.warn(`[RegionFailoverService] FAILOVER initiated from '${failedRegion}' — reason: ${reason}`);

    globalDeploymentManager.markRegionUnhealthy(failedRegion);
    const healthyRegions = globalDeploymentManager.getHealthyRegions();

    if (healthyRegions.length === 0) {
      throw new Error('CRITICAL: All regions unhealthy — cannot failover');
    }

    const targetRegion = healthyRegions.sort((a, b) => (a.latencyMs || 999) - (b.latencyMs || 999))[0];
    const rtoSeconds = Math.round((Date.now() - start) / 1000);

    const event: FailoverEvent = {
      timestamp: new Date().toISOString(),
      fromRegion: failedRegion,
      toRegion: targetRegion.id,
      reason,
      rtoSeconds,
    };

    this.failoverHistory.push(event);
    logger.info(`[RegionFailoverService] Failover COMPLETE → ${targetRegion.label} (RTO: ${rtoSeconds}s, Target: <${this.rtoTargetSeconds}s)`);

    if (rtoSeconds > this.rtoTargetSeconds) {
      logger.warn(`[RegionFailoverService] ⚠️ RTO BREACHED: ${rtoSeconds}s > target ${this.rtoTargetSeconds}s`);
    }

    return event;
  }

  async restoreRegion(regionId: Region): Promise<void> {
    globalDeploymentManager.markRegionHealthy(regionId);
    logger.info(`[RegionFailoverService] Region '${regionId}' restored and re-activated in global pool`);
  }

  getFailoverHistory(): FailoverEvent[] {
    return [...this.failoverHistory];
  }

  getRegionHealth(): Record<string, unknown> {
    const topology = globalDeploymentManager.getRegionTopology() as { regions: Array<Record<string, unknown>> };
    return {
      rtoTargetSeconds: this.rtoTargetSeconds,
      totalFailovers: this.failoverHistory.length,
      lastFailover: this.failoverHistory[this.failoverHistory.length - 1] || null,
      ...topology,
    };
  }
}

export const regionFailoverService = new RegionFailoverService();
