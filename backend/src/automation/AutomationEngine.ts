import { logger } from '../config/logger';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'cron' | 'webhook' | 'render_complete' | 'generation_finished';
  cronSchedule?: string;
  action: 'render' | 'publish' | 'backup' | 'notify';
  payload: Record<string, unknown>;
  isActive: boolean;
}

export class AutomationEngine {
  private rules: AutomationRule[] = [];

  constructor() {
    this.addRule({
      id: 'auto-rule-1',
      name: 'Nightly Render & Backup Cron',
      trigger: 'cron',
      cronSchedule: '0 2 * * *',
      action: 'backup',
      payload: { type: 'database_backup' },
      isActive: true,
    });
  }

  addRule(rule: AutomationRule): void {
    this.rules.push(rule);
    logger.info(`[AutomationEngine] Created automation rule '${rule.name}' (${rule.trigger} → ${rule.action})`);
  }

  async triggerEvent(event: string, data: Record<string, unknown>): Promise<void> {
    const matchingRules = this.rules.filter((r) => r.isActive && r.trigger === event);
    logger.info(`[AutomationEngine] Event '${event}' triggered ${matchingRules.length} matching automation rules`);

    for (const rule of matchingRules) {
      logger.info(`[AutomationEngine] Executing automated action '${rule.action}' for rule '${rule.name}'`);
    }
  }

  listRules(): AutomationRule[] {
    return [...this.rules];
  }
}

export const automationEngine = new AutomationEngine();
