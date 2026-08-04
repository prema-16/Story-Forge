import { logger } from '../config/logger';

export type OWASPLevel = 'L1' | 'L2' | 'L3';
export type CheckStatus = 'pass' | 'fail' | 'partial' | 'na';

export interface OWASPCheck {
  id: string;
  category: string;
  requirement: string;
  level: OWASPLevel;
  status: CheckStatus;
  notes?: string;
}

export class OWASPChecklist {
  private checks: OWASPCheck[] = [
    // V1 Architecture
    { id: 'V1.1', category: 'Architecture', requirement: 'Application components are identified and documented', level: 'L1', status: 'pass', notes: 'Documented in AIOS_ARCHITECTURE.md' },
    { id: 'V1.2', category: 'Architecture', requirement: 'All application components are inventoried (SBOM)', level: 'L2', status: 'pass', notes: 'CycloneDX SBOM generated via SBOMGenerator.ts' },
    // V2 Auth
    { id: 'V2.1', category: 'Authentication', requirement: 'Verify credentials not sent in clear text', level: 'L1', status: 'pass', notes: 'HTTPS enforced, bcrypt password hashing' },
    { id: 'V2.2', category: 'Authentication', requirement: 'Multi-factor authentication support', level: 'L2', status: 'partial', notes: 'JWT + device fingerprinting; TOTP planned for v1.1' },
    { id: 'V2.3', category: 'Authentication', requirement: 'Anti-automation on auth endpoints', level: 'L1', status: 'pass', notes: 'Rate limiter: 20 req/15min on /api/auth/' },
    // V3 Sessions
    { id: 'V3.1', category: 'Session', requirement: 'Session tokens are random with >= 128 bits entropy', level: 'L1', status: 'pass', notes: 'JWT with RS256 signing' },
    { id: 'V3.2', category: 'Session', requirement: 'Session invalidation on logout', level: 'L1', status: 'pass', notes: 'Token blacklist in Redis' },
    // V4 Access Control
    { id: 'V4.1', category: 'Access Control', requirement: 'Least privilege enforced on all routes', level: 'L1', status: 'pass', notes: 'protect middleware + RBAC roles' },
    { id: 'V4.2', category: 'Access Control', requirement: 'User cannot access other users\' data', level: 'L1', status: 'pass', notes: 'Owner checks in all controllers' },
    // V5 Input Validation
    { id: 'V5.1', category: 'Input Validation', requirement: 'All inputs are validated on server side', level: 'L1', status: 'pass', notes: 'Zod schemas on all POST/PATCH routes' },
    { id: 'V5.2', category: 'Input Validation', requirement: 'Sanitization against XSS', level: 'L1', status: 'pass', notes: 'sanitizeInput middleware in index.ts' },
    { id: 'V5.3', category: 'Input Validation', requirement: 'SQL/NoSQL injection prevention', level: 'L1', status: 'pass', notes: 'Mongoose ODM parameterized queries' },
    // V6 Cryptography
    { id: 'V6.1', category: 'Cryptography', requirement: 'Data at rest encrypted', level: 'L2', status: 'pass', notes: 'MongoDB encrypted at rest (Atlas ENC)' },
    { id: 'V6.2', category: 'Cryptography', requirement: 'Secure random number generation', level: 'L1', status: 'pass', notes: 'crypto.randomUUID() used throughout' },
    // V7 Error Handling & Logging
    { id: 'V7.1', category: 'Error Handling', requirement: 'No sensitive information in error messages', level: 'L1', status: 'pass', notes: 'Global errorHandler strips stack traces in production' },
    { id: 'V7.2', category: 'Logging', requirement: 'Login events logged', level: 'L2', status: 'pass', notes: 'AuditLog model records all auth events' },
    // V8 Data Protection
    { id: 'V8.1', category: 'Data Protection', requirement: 'Sensitive data identified and classified', level: 'L2', status: 'pass', notes: 'PII flagged in User model, GDPR service handles erasure' },
    { id: 'V8.2', category: 'Data Protection', requirement: 'Data deletion capability', level: 'L2', status: 'pass', notes: 'GDPRService.eraseUserData()' },
    // V9 Communications
    { id: 'V9.1', category: 'Communications', requirement: 'TLS 1.2+ enforced for all connections', level: 'L1', status: 'pass', notes: 'HTTPS via Ingress TLS + Helmet headers' },
    // V14 Configuration
    { id: 'V14.1', category: 'Configuration', requirement: 'No secrets in source code', level: 'L1', status: 'pass', notes: 'All secrets in .env, Kubernetes Secrets, and ExternalSecrets' },
    { id: 'V14.2', category: 'Configuration', requirement: 'HTTP security headers present', level: 'L1', status: 'pass', notes: 'Helmet.js configured in index.ts' },
  ];

  getChecklist(): OWASPCheck[] {
    return [...this.checks];
  }

  getReport(): { total: number; pass: number; fail: number; partial: number; passPct: number } {
    const pass = this.checks.filter((c) => c.status === 'pass').length;
    const fail = this.checks.filter((c) => c.status === 'fail').length;
    const partial = this.checks.filter((c) => c.status === 'partial').length;
    const total = this.checks.length;
    const passPct = Math.round((pass / total) * 100);

    logger.info(`[OWASPChecklist] ASVS Compliance: ${pass}/${total} passed (${passPct}%)`);
    return { total, pass, fail, partial, passPct };
  }

  getFailedChecks(): OWASPCheck[] {
    return this.checks.filter((c) => c.status === 'fail');
  }
}

export const owaspChecklist = new OWASPChecklist();
