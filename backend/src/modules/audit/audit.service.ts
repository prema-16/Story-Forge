import { AuditRepository, auditRepository } from './audit.repository';
import type { AuditLogEntry, AuditEventType } from '@storyforge/shared';

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository = auditRepository) {}

  async log(params: {
    userId?: string;
    organizationId?: string;
    action: AuditEventType | string;
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
  }): Promise<AuditLogEntry> {
    const entry = await this.auditRepo.logEvent(params);
    return entry.toObject() as unknown as AuditLogEntry;
  }

  async getUserAuditLogs(userId: string, limit = 50): Promise<AuditLogEntry[]> {
    const logs = await this.auditRepo.findRecentByUserId(userId, limit);
    return logs.map((l) => l.toObject() as unknown as AuditLogEntry);
  }

  async getOrgAuditLogs(organizationId: string, limit = 100): Promise<AuditLogEntry[]> {
    const logs = await this.auditRepo.findRecentByOrganization(organizationId, limit);
    return logs.map((l) => l.toObject() as unknown as AuditLogEntry);
  }
}

export const auditService = new AuditService();
