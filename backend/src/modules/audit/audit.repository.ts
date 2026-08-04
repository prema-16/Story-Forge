import { BaseRepository } from '../../repositories/base.repository';
import { AuditLog, IAuditLog } from '../../models/AuditLog';
import type { AuditEventType } from '@storyforge/shared';

export class AuditRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async logEvent(params: {
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
  }): Promise<IAuditLog> {
    return this.model.create({
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      metadata: params.metadata,
      ip: params.ip || '127.0.0.1',
      userAgent: params.userAgent || 'Unknown',
      success: params.success ?? true,
      errorMessage: params.errorMessage,
    });
  }

  async findRecentByUserId(userId: string, limit = 50): Promise<IAuditLog[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async findRecentByOrganization(organizationId: string, limit = 100): Promise<IAuditLog[]> {
    return this.model.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export const auditRepository = new AuditRepository();
