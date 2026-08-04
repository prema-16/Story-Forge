import { logger } from '../config/logger';

export interface RetentionRule {
  dataClass: string;
  retentionDays: number;
  action: 'delete' | 'anonymize' | 'archive';
  description: string;
}

export class DataRetentionPolicy {
  private rules: RetentionRule[] = [
    { dataClass: 'user_logs', retentionDays: 90, action: 'delete', description: 'Raw access and system logs' },
    { dataClass: 'audit_events', retentionDays: 365, action: 'archive', description: 'Security audit logs for SOC2 compliance' },
    { dataClass: 'temp_renders', retentionDays: 7, action: 'delete', description: 'Intermediate video render chunks' },
    { dataClass: 'deleted_user_pii', retentionDays: 30, action: 'anonymize', description: 'Post-erasure request anonymization window' },
  ];

  getRules(): RetentionRule[] {
    return [...this.rules];
  }

  evaluateRetention(dataClass: string, createdAt: Date): { expired: boolean; action?: string } {
    const rule = this.rules.find((r) => r.dataClass === dataClass);
    if (!rule) return { expired: false };

    const ageDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const expired = ageDays > rule.retentionDays;
    return { expired, action: expired ? rule.action : undefined };
  }
}

export const dataRetentionPolicy = new DataRetentionPolicy();
