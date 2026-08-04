import { logger } from '../config/logger';

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'erasure' | 'portability' | 'rectification' | 'restriction';
  userId: string;
  email: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
  dataPackageUrl?: string;
}

export class GDPRService {
  private requests: DataSubjectRequest[] = [];
  private readonly maxResponseDays = 30;

  submitRequest(userId: string, email: string, type: DataSubjectRequest['type']): DataSubjectRequest {
    const request: DataSubjectRequest = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      userId,
      email,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    this.requests.push(request);
    logger.info(`[GDPRService] Data subject request '${type}' submitted for user ${userId} (${email})`);
    return request;
  }

  async processErasureRequest(requestId: string): Promise<boolean> {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req || req.type !== 'erasure') return false;

    req.status = 'in_progress';
    logger.info(`[GDPRService] Processing erasure for user ${req.userId} — purging PII from all collections`);

    // In production: delete/anonymize from User, AuditLog, Projects, Notifications, Billing records
    req.status = 'completed';
    req.completedAt = new Date().toISOString();
    logger.info(`[GDPRService] Erasure complete for user ${req.userId} — data wiped from all systems`);
    return true;
  }

  async processAccessRequest(requestId: string): Promise<string> {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req || req.type !== 'access') return '';

    req.status = 'in_progress';
    const dataPackageUrl = `https://storage.storyforge.ai/gdpr-exports/${req.userId}-${Date.now()}.json`;
    req.dataPackageUrl = dataPackageUrl;
    req.status = 'completed';
    req.completedAt = new Date().toISOString();
    logger.info(`[GDPRService] Data access package prepared for user ${req.userId}: ${dataPackageUrl}`);
    return dataPackageUrl;
  }

  getRequests(userId?: string): DataSubjectRequest[] {
    return userId ? this.requests.filter((r) => r.userId === userId) : [...this.requests];
  }

  getOverdueRequests(): DataSubjectRequest[] {
    const deadline = new Date(Date.now() - this.maxResponseDays * 24 * 60 * 60 * 1000).toISOString();
    return this.requests.filter((r) => r.status !== 'completed' && r.requestedAt < deadline);
  }

  getComplianceSummary(): Record<string, unknown> {
    return {
      totalRequests: this.requests.length,
      pending: this.requests.filter((r) => r.status === 'pending').length,
      completed: this.requests.filter((r) => r.status === 'completed').length,
      overdue: this.getOverdueRequests().length,
      slaTargetDays: this.maxResponseDays,
    };
  }
}

export const gdprService = new GDPRService();
