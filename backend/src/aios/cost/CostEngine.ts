import { logger } from '../../config/logger';

export interface CostRecord {
  userId: string;
  organizationId?: string;
  projectId?: string;
  providerId: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  latencyMs: number;
  timestamp: string;
}

export class CostEngine {
  private records: CostRecord[] = [];

  recordCost(record: Omit<CostRecord, 'timestamp'>): void {
    const fullRecord: CostRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };
    this.records.push(fullRecord);
    logger.debug(`[CostEngine] Tracked $${record.costUSD.toFixed(4)} USD for user ${record.userId} via ${record.providerId}`);
  }

  getUserSpend(userId: string): number {
    return this.records
      .filter((r) => r.userId === userId)
      .reduce((sum, r) => sum + r.costUSD, 0);
  }

  getOrgSpend(orgId: string): number {
    return this.records
      .filter((r) => r.organizationId === orgId)
      .reduce((sum, r) => sum + r.costUSD, 0);
  }

  forecastMonthlySpend(userId: string): { currentSpend: number; forecastedMonthly: number } {
    const userSpend = this.getUserSpend(userId);
    const dayOfMonth = new Date().getDate();
    const forecastedMonthly = (userSpend / Math.max(1, dayOfMonth)) * 30;

    return {
      currentSpend: Number(userSpend.toFixed(2)),
      forecastedMonthly: Number(forecastedMonthly.toFixed(2)),
    };
  }
}

export const costEngine = new CostEngine();
