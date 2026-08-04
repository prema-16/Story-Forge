import { logger } from '../config/logger';
import { metricsCollector } from './MetricsCollector';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertState = 'firing' | 'resolved' | 'pending';

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  notifyChannels: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  state: AlertState;
  value: number;
  threshold: number;
  message: string;
  firedAt: string;
  resolvedAt?: string;
}

export class AlertManager {
  private rules: AlertRule[] = [
    { id: 'rule_latency_p95', name: 'API p95 Latency Breach', condition: 'api_p95_latency_ms > 200', threshold: 200, severity: 'critical', notifyChannels: ['slack', 'pagerduty'] },
    { id: 'rule_ai_latency', name: 'AI Provider Latency Spike', condition: 'ai_provider_latency_ms > 5000', threshold: 5000, severity: 'warning', notifyChannels: ['slack'] },
    { id: 'rule_queue_depth', name: 'Queue Depth High', condition: 'queue_depth > 1000', threshold: 1000, severity: 'warning', notifyChannels: ['slack'] },
    { id: 'rule_error_rate', name: 'Error Rate Elevated', condition: 'error_rate_pct > 1', threshold: 1, severity: 'critical', notifyChannels: ['slack', 'pagerduty', 'email'] },
    { id: 'rule_gpu_util', name: 'GPU Utilization Critical', condition: 'gpu_util_pct > 90', threshold: 90, severity: 'warning', notifyChannels: ['slack'] },
    { id: 'rule_memory', name: 'Memory Usage High', condition: 'memory_pct > 85', threshold: 85, severity: 'warning', notifyChannels: ['slack'] },
    { id: 'rule_region_down', name: 'Region Unhealthy', condition: 'healthy_regions < 5', threshold: 5, severity: 'critical', notifyChannels: ['slack', 'pagerduty'] },
  ];

  private activeAlerts: Alert[] = [];
  private alertHistory: Alert[] = [];

  evaluateMetric(metricName: string, value: number): Alert[] {
    const triggered: Alert[] = [];

    for (const rule of this.rules) {
      if (!rule.condition.includes(metricName)) continue;

      const existing = this.activeAlerts.find((a) => a.ruleId === rule.id);

      if (value > rule.threshold) {
        if (!existing) {
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            state: 'firing',
            value,
            threshold: rule.threshold,
            message: `${rule.name}: ${metricName}=${value} (threshold: ${rule.threshold})`,
            firedAt: new Date().toISOString(),
          };
          this.activeAlerts.push(alert);
          this.alertHistory.push(alert);
          triggered.push(alert);
          logger.warn(`[AlertManager] 🚨 ALERT FIRING [${rule.severity.toUpperCase()}]: ${alert.message}`);
        }
      } else if (existing) {
        existing.state = 'resolved';
        existing.resolvedAt = new Date().toISOString();
        this.activeAlerts = this.activeAlerts.filter((a) => a.ruleId !== rule.id);
        logger.info(`[AlertManager] ✅ Alert resolved: ${rule.name}`);
      }
    }

    return triggered;
  }

  getActiveAlerts(): Alert[] {
    return [...this.activeAlerts];
  }

  getRules(): AlertRule[] {
    return [...this.rules];
  }

  getAlertSummary(): Record<string, unknown> {
    const critical = this.activeAlerts.filter((a) => a.severity === 'critical').length;
    const warning = this.activeAlerts.filter((a) => a.severity === 'warning').length;

    return {
      activeAlerts: this.activeAlerts.length,
      criticalAlerts: critical,
      warningAlerts: warning,
      totalRules: this.rules.length,
      totalHistoricAlerts: this.alertHistory.length,
    };
  }
}

export const alertManager = new AlertManager();
