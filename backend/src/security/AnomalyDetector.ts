import { logger } from '../config/logger';

export type AnomalyType = 'rate_spike' | 'geo_anomaly' | 'credential_stuffing' | 'scanner_detected' | 'suspicious_agent';

export interface AnomalyEvent {
  id: string;
  type: AnomalyType;
  ip: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  blocked: boolean;
  timestamp: string;
}

export interface IPProfile {
  ip: string;
  requestCount: number;
  errorCount: number;
  firstSeen: string;
  lastSeen: string;
  reputation: 'clean' | 'suspicious' | 'blocked';
  userAgents: Set<string>;
}

export class AnomalyDetector {
  private ipProfiles = new Map<string, IPProfile>();
  private anomalies: AnomalyEvent[] = [];
  private blockedIPs = new Set<string>();

  private readonly thresholds = {
    requestsPerMinute: 300,
    errorsPerMinute: 50,
    maxUserAgents: 10,
  };

  recordRequest(ip: string, userAgent: string, isError = false): AnomalyEvent | null {
    const now = new Date().toISOString();

    if (this.blockedIPs.has(ip)) {
      return this.createAnomaly('scanner_detected', ip, 'critical', 'Request from blocked IP', true);
    }

    let profile = this.ipProfiles.get(ip);
    if (!profile) {
      profile = {
        ip, requestCount: 0, errorCount: 0,
        firstSeen: now, lastSeen: now,
        reputation: 'clean', userAgents: new Set(),
      };
      this.ipProfiles.set(ip, profile);
    }

    profile.requestCount++;
    profile.lastSeen = now;
    profile.userAgents.add(userAgent);
    if (isError) profile.errorCount++;

    if (profile.requestCount > this.thresholds.requestsPerMinute) {
      this.blockedIPs.add(ip);
      profile.reputation = 'blocked';
      return this.createAnomaly('rate_spike', ip, 'critical', `Request rate exceeded: ${profile.requestCount}/min`, true);
    }

    if (profile.userAgents.size > this.thresholds.maxUserAgents) {
      profile.reputation = 'suspicious';
      return this.createAnomaly('credential_stuffing', ip, 'high', `Suspicious UA rotation: ${profile.userAgents.size} unique agents`, false);
    }

    const suspiciousAgentPatterns = ['sqlmap', 'nikto', 'nmap', 'masscan', 'burpsuite', 'dirbuster'];
    if (suspiciousAgentPatterns.some((p) => userAgent.toLowerCase().includes(p))) {
      this.blockedIPs.add(ip);
      return this.createAnomaly('scanner_detected', ip, 'critical', `Security scanner detected: ${userAgent}`, true);
    }

    return null;
  }

  private createAnomaly(type: AnomalyType, ip: string, severity: AnomalyEvent['severity'], details: string, blocked: boolean): AnomalyEvent {
    const event: AnomalyEvent = {
      id: `anomaly_${Date.now()}`,
      type,
      ip,
      severity,
      details,
      blocked,
      timestamp: new Date().toISOString(),
    };
    this.anomalies.push(event);
    logger.warn(`[AnomalyDetector] 🚨 ${severity.toUpperCase()} anomaly from ${ip}: ${details} (blocked=${blocked})`);
    return event;
  }

  getAnomalies(severity?: AnomalyEvent['severity']): AnomalyEvent[] {
    return severity ? this.anomalies.filter((a) => a.severity === severity) : [...this.anomalies];
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getSummary(): Record<string, unknown> {
    return {
      totalAnomalies: this.anomalies.length,
      blockedIPs: this.blockedIPs.size,
      trackedIPs: this.ipProfiles.size,
      critical: this.anomalies.filter((a) => a.severity === 'critical').length,
      high: this.anomalies.filter((a) => a.severity === 'high').length,
    };
  }
}

export const anomalyDetector = new AnomalyDetector();
