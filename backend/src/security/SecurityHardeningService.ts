import { logger } from '../config/logger';
import { owaspChecklist } from './OWASPChecklist';
import { sbomGenerator } from './SBOMGenerator';
import { anomalyDetector } from './AnomalyDetector';
import { wafIntegration } from './WAFIntegration';

export class SecurityHardeningService {
  getSecurityStatus(): Record<string, unknown> {
    const owasp = owaspChecklist.getReport();
    const sbom = sbomGenerator.generate();
    const anomalies = anomalyDetector.getSummary();
    const wafRules = wafIntegration.getRules().length;

    logger.info('[SecurityHardeningService] Compiled security status report');
    return {
      owaspCompliancePct: owasp.passPct,
      trackedComponents: sbom.components.length,
      activeWafRules: wafRules,
      anomalies,
      hardeningLevel: 'ASVS Level 2 Production Enforced',
    };
  }
}

export const securityHardeningService = new SecurityHardeningService();
