import { logger } from '../config/logger';

export type StorageTier = 'hot' | 'warm' | 'cold' | 'archive' | 'deleted';

export interface StorageAsset {
  id: string;
  key: string;
  sizeBytes: number;
  tier: StorageTier;
  lastAccessedAt: string;
  createdAt: string;
  costPerGbMonth: number;
}

export interface MonthlyCostForecast {
  month: string;
  aiCostUSD: number;
  storageCostUSD: number;
  computeCostUSD: number;
  bandwidthCostUSD: number;
  totalCostUSD: number;
  savingsFromOptimizationUSD: number;
}

export class CostForecastingService {
  private assets: StorageAsset[] = [];

  private tierCosts: Record<StorageTier, number> = {
    hot: 0.023,     // S3 Standard per GB/month
    warm: 0.0125,   // S3 Standard-IA
    cold: 0.004,    // S3 Glacier
    archive: 0.00099, // S3 Glacier Deep Archive
    deleted: 0,
  };

  registerAsset(key: string, sizeBytes: number): StorageAsset {
    const asset: StorageAsset = {
      id: `asset_${Date.now()}`,
      key,
      sizeBytes,
      tier: 'hot',
      lastAccessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      costPerGbMonth: this.tierCosts.hot,
    };
    this.assets.push(asset);
    return asset;
  }

  optimizeStorageTiers(): { movedAssets: number; estimatedSavingsUSD: number } {
    let movedAssets = 0;
    let savingsUSD = 0;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    for (const asset of this.assets) {
      const daysSinceAccess = (now - new Date(asset.lastAccessedAt).getTime()) / day;
      let newTier = asset.tier;

      if (daysSinceAccess > 365) newTier = 'archive';
      else if (daysSinceAccess > 90) newTier = 'cold';
      else if (daysSinceAccess > 30) newTier = 'warm';

      if (newTier !== asset.tier) {
        const sizeGb = asset.sizeBytes / (1024 ** 3);
        const oldCost = this.tierCosts[asset.tier] * sizeGb;
        const newCost = this.tierCosts[newTier] * sizeGb;
        savingsUSD += (oldCost - newCost);
        asset.tier = newTier;
        asset.costPerGbMonth = this.tierCosts[newTier];
        movedAssets++;
        logger.info(`[CostForecastingService] Asset '${asset.key}' moved from ${asset.tier} → ${newTier}`);
      }
    }

    return { movedAssets, estimatedSavingsUSD: Math.round(savingsUSD * 100) / 100 };
  }

  generateMonthlyForecast(dailyActiveUsers: number, dailyRenders: number): MonthlyCostForecast {
    const aiCostPerRender = 0.12;
    const storageGrowthGbPerDay = dailyRenders * 2.5;
    const computePerUser = 0.0008;

    const aiCost = Math.round(dailyRenders * aiCostPerRender * 30 * 100) / 100;
    const storageCost = Math.round(storageGrowthGbPerDay * 30 * this.tierCosts.hot * 100) / 100;
    const computeCost = Math.round(dailyActiveUsers * computePerUser * 30 * 100) / 100;
    const bandwidthCost = Math.round(dailyRenders * 0.05 * 30 * 100) / 100;
    const savingsFromOptimization = Math.round((aiCost + storageCost) * 0.22 * 100) / 100;

    const forecast: MonthlyCostForecast = {
      month: new Date().toISOString().substring(0, 7),
      aiCostUSD: aiCost,
      storageCostUSD: storageCost,
      computeCostUSD: computeCost,
      bandwidthCostUSD: bandwidthCost,
      totalCostUSD: aiCost + storageCost + computeCost + bandwidthCost,
      savingsFromOptimizationUSD: savingsFromOptimization,
    };

    logger.info(`[CostForecastingService] Monthly forecast: Total=$${forecast.totalCostUSD}, Savings=$${savingsFromOptimization}`);
    return forecast;
  }

  getTotalStorageCost(): number {
    return this.assets.reduce((sum, a) => {
      const sizeGb = a.sizeBytes / (1024 ** 3);
      return sum + (a.costPerGbMonth * sizeGb);
    }, 0);
  }
}

export const costForecastingService = new CostForecastingService();
