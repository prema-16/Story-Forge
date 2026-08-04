import { logger } from '../config/logger';

export type Framework = 'GDPR' | 'SOC2' | 'ISO27001';

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: string;
  granted: boolean;
  version: string;
  timestamp: string;
  ipAddress?: string;
  withdrawnAt?: string;
}

export interface ComplianceControl {
  framework: Framework;
  controlId: string;
  title: string;
  status: 'implemented' | 'partial' | 'planned' | 'na';
  evidence?: string;
}

export class ComplianceReportGenerator {
  private consentRecords: ConsentRecord[] = [];

  private controls: ComplianceControl[] = [
    // GDPR Controls
    { framework: 'GDPR', controlId: 'Art.13', title: 'Transparency & Privacy Notice', status: 'implemented', evidence: 'Privacy policy v2.1 displayed at registration' },
    { framework: 'GDPR', controlId: 'Art.17', title: 'Right to Erasure', status: 'implemented', evidence: 'GDPRService.processErasureRequest()' },
    { framework: 'GDPR', controlId: 'Art.20', title: 'Data Portability', status: 'implemented', evidence: 'GDPRService.processAccessRequest() returns JSON export' },
    { framework: 'GDPR', controlId: 'Art.32', title: 'Security of Processing', status: 'implemented', evidence: 'TLS 1.3, AES-256 at rest, bcrypt passwords' },
    { framework: 'GDPR', controlId: 'Art.33', title: 'Breach Notification (72h)', status: 'implemented', evidence: 'AlertManager fires auto-notification process to DPO' },
    // SOC 2 Controls
    { framework: 'SOC2', controlId: 'CC6.1', title: 'Logical Access Controls', status: 'implemented', evidence: 'JWT auth + RBAC roles + protect middleware' },
    { framework: 'SOC2', controlId: 'CC6.2', title: 'Authentication Controls', status: 'implemented', evidence: 'Rate limiting + anomaly detection' },
    { framework: 'SOC2', controlId: 'CC7.1', title: 'Monitoring', status: 'implemented', evidence: 'MetricsCollector + AlertManager + TracingService' },
    { framework: 'SOC2', controlId: 'CC8.1', title: 'Change Management', status: 'implemented', evidence: 'GitHub CI/CD with PR reviews and canary deployments' },
    { framework: 'SOC2', controlId: 'A1.1', title: 'Availability Monitoring', status: 'implemented', evidence: 'Health endpoints + Grafana dashboards + 99.95% SLA' },
    // ISO 27001 Controls
    { framework: 'ISO27001', controlId: 'A.8.2', title: 'Information Classification', status: 'implemented', evidence: 'PII data classified in User model and GDPR policies' },
    { framework: 'ISO27001', controlId: 'A.9.4', title: 'System Access Control', status: 'implemented', evidence: 'Kubernetes RBAC + database IAM roles' },
    { framework: 'ISO27001', controlId: 'A.12.1', title: 'Operational Procedures', status: 'implemented', evidence: 'OPERATIONS.md runbook documented' },
    { framework: 'ISO27001', controlId: 'A.17.1', title: 'Business Continuity', status: 'implemented', evidence: 'DisasterRecoveryService + multi-region failover' },
  ];

  recordConsent(userId: string, purpose: string, granted: boolean, version = '2.1', ipAddress?: string): ConsentRecord {
    const record: ConsentRecord = {
      id: `consent_${Date.now()}`,
      userId,
      purpose,
      granted,
      version,
      timestamp: new Date().toISOString(),
      ipAddress,
    };
    this.consentRecords.push(record);
    logger.info(`[ComplianceReportGenerator] Consent recorded for user ${userId}: ${purpose}=${granted}`);
    return record;
  }

  withdrawConsent(userId: string, purpose: string): boolean {
    const record = [...this.consentRecords].reverse().find((c: ConsentRecord) => c.userId === userId && c.purpose === purpose && c.granted);
    if (record) {
      record.granted = false;
      record.withdrawnAt = new Date().toISOString();
      logger.info(`[ComplianceReportGenerator] Consent withdrawn for user ${userId}: ${purpose}`);
      return true;
    }
    return false;
  }

  generateReport(framework: Framework): Record<string, unknown> {
    const frameworkControls = this.controls.filter((c) => c.framework === framework);
    const implemented = frameworkControls.filter((c) => c.status === 'implemented').length;
    const total = frameworkControls.length;
    const compliancePct = Math.round((implemented / total) * 100);

    logger.info(`[ComplianceReportGenerator] ${framework} Compliance Report: ${implemented}/${total} controls (${compliancePct}%)`);
    return {
      framework,
      generatedAt: new Date().toISOString(),
      compliancePct,
      implemented,
      partial: frameworkControls.filter((c) => c.status === 'partial').length,
      total,
      controls: frameworkControls,
    };
  }

  getAllFrameworkSummary(): Record<Framework, { compliancePct: number; total: number; implemented: number }> {
    const frameworks: Framework[] = ['GDPR', 'SOC2', 'ISO27001'];
    const result = {} as Record<Framework, { compliancePct: number; total: number; implemented: number }>;
    for (const fw of frameworks) {
      const controls = this.controls.filter((c) => c.framework === fw);
      const implemented = controls.filter((c) => c.status === 'implemented').length;
      result[fw] = {
        compliancePct: Math.round((implemented / controls.length) * 100),
        total: controls.length,
        implemented,
      };
    }
    return result;
  }
}

export const complianceReportGenerator = new ComplianceReportGenerator();
