import { logger } from '../config/logger';

export interface WAFRule {
  id: string;
  name: string;
  action: 'block' | 'challenge' | 'allow' | 'log';
  pattern: string;
  enabled: boolean;
}

export class WAFIntegration {
  private rules: WAFRule[] = [
    { id: 'waf_001', name: 'SQL Injection Prevention', action: 'block', pattern: "(?i)(union select|select.*from|insert into|drop table)", enabled: true },
    { id: 'waf_002', name: 'XSS Script Tag Filter', action: 'block', pattern: "(?i)(<script|javascript:|onerror=|onload=)", enabled: true },
    { id: 'waf_003', name: 'Path Traversal Prevention', action: 'block', pattern: "(\\.\\./|\\.\\.\\\\)", enabled: true },
    { id: 'waf_004', name: 'Rate Spike Challenge', action: 'challenge', pattern: "rate > 100 req/10s", enabled: true },
  ];

  inspectRequest(uri: string, body: string): { blocked: boolean; matchedRule?: WAFRule } {
    const payload = `${uri} ${body}`;
    for (const rule of this.rules) {
      if (rule.enabled && rule.action === 'block') {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(payload)) {
          logger.warn(`[WAF] Blocked request matching rule '${rule.name}' on URI: ${uri}`);
          return { blocked: true, matchedRule: rule };
        }
      }
    }
    return { blocked: false };
  }

  getRules(): WAFRule[] {
    return [...this.rules];
  }
}

export const wafIntegration = new WAFIntegration();
