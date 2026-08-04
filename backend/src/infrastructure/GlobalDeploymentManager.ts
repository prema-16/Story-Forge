import { logger } from '../config/logger';

export type Region = 'us-east-1' | 'us-west-2' | 'eu-west-1' | 'ap-south-1' | 'ap-southeast-1' | 'ap-southeast-2';

export interface RegionConfig {
  id: Region;
  label: string;
  primary: boolean;
  mongoUri: string;
  redisUri: string;
  cdnEndpoint: string;
  latencyMs?: number;
  healthy?: boolean;
}

export interface TrafficRoutingDecision {
  region: Region;
  reason: string;
  latencyMs: number;
}

export class GlobalDeploymentManager {
  private regions: Map<Region, RegionConfig> = new Map([
    ['us-east-1', {
      id: 'us-east-1', label: 'US East (Virginia)', primary: true,
      mongoUri: 'mongodb+srv://us-east-cluster.storyforge.ai',
      redisUri: 'redis://us-east-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-us-east.storyforge.ai',
      latencyMs: 12, healthy: true,
    }],
    ['us-west-2', {
      id: 'us-west-2', label: 'US West (Oregon)', primary: false,
      mongoUri: 'mongodb+srv://us-west-cluster.storyforge.ai',
      redisUri: 'redis://us-west-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-us-west.storyforge.ai',
      latencyMs: 18, healthy: true,
    }],
    ['eu-west-1', {
      id: 'eu-west-1', label: 'Europe (Ireland)', primary: false,
      mongoUri: 'mongodb+srv://eu-cluster.storyforge.ai',
      redisUri: 'redis://eu-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-eu.storyforge.ai',
      latencyMs: 22, healthy: true,
    }],
    ['ap-south-1', {
      id: 'ap-south-1', label: 'India (Mumbai)', primary: false,
      mongoUri: 'mongodb+srv://india-cluster.storyforge.ai',
      redisUri: 'redis://india-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-india.storyforge.ai',
      latencyMs: 28, healthy: true,
    }],
    ['ap-southeast-1', {
      id: 'ap-southeast-1', label: 'Singapore', primary: false,
      mongoUri: 'mongodb+srv://sg-cluster.storyforge.ai',
      redisUri: 'redis://sg-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-sg.storyforge.ai',
      latencyMs: 25, healthy: true,
    }],
    ['ap-southeast-2', {
      id: 'ap-southeast-2', label: 'Australia (Sydney)', primary: false,
      mongoUri: 'mongodb+srv://au-cluster.storyforge.ai',
      redisUri: 'redis://au-cache.storyforge.ai:6379',
      cdnEndpoint: 'https://cdn-au.storyforge.ai',
      latencyMs: 35, healthy: true,
    }],
  ]);

  getAllRegions(): RegionConfig[] {
    return Array.from(this.regions.values());
  }

  getRegion(id: Region): RegionConfig | undefined {
    return this.regions.get(id);
  }

  getPrimaryRegion(): RegionConfig {
    return Array.from(this.regions.values()).find((r) => r.primary)!;
  }

  getHealthyRegions(): RegionConfig[] {
    return Array.from(this.regions.values()).filter((r) => r.healthy);
  }

  routeTrafficByLatency(clientRegionHint?: string): TrafficRoutingDecision {
    const healthy = this.getHealthyRegions();
    if (healthy.length === 0) {
      throw new Error('No healthy regions available');
    }

    const sorted = healthy.sort((a, b) => (a.latencyMs || 999) - (b.latencyMs || 999));
    const best = sorted[0];

    logger.info(`[GlobalDeploymentManager] Routed traffic to ${best.label} (${best.latencyMs}ms)`);
    return { region: best.id, reason: 'latency-based', latencyMs: best.latencyMs || 0 };
  }

  markRegionUnhealthy(regionId: Region): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.healthy = false;
      logger.warn(`[GlobalDeploymentManager] Region '${region.label}' marked UNHEALTHY — triggering failover`);
    }
  }

  markRegionHealthy(regionId: Region): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.healthy = true;
      logger.info(`[GlobalDeploymentManager] Region '${region.label}' recovered — marking HEALTHY`);
    }
  }

  getRegionTopology(): Record<string, unknown> {
    return {
      totalRegions: this.regions.size,
      healthyRegions: this.getHealthyRegions().length,
      primaryRegion: this.getPrimaryRegion().label,
      regions: this.getAllRegions().map((r) => ({
        id: r.id, label: r.label, primary: r.primary,
        latencyMs: r.latencyMs, healthy: r.healthy,
        cdnEndpoint: r.cdnEndpoint,
      })),
    };
  }
}

export const globalDeploymentManager = new GlobalDeploymentManager();
