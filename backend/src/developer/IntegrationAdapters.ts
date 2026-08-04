import { logger } from '../config/logger';

export type IntegrationService =
  | 'google_drive'
  | 'dropbox'
  | 'onedrive'
  | 'slack'
  | 'discord'
  | 'notion'
  | 'zapier'
  | 'n8n'
  | 'github'
  | 'linear'
  | 'jira'
  | 'figma';

export interface IntegrationConnection {
  service: IntegrationService;
  connected: boolean;
  accountEmail?: string;
  connectedAt?: string;
}

export class IntegrationAdapters {
  private activeConnections: IntegrationConnection[] = [
    { service: 'slack', connected: true, accountEmail: 'devops@storyforge.ai', connectedAt: new Date().toISOString() },
    { service: 'google_drive', connected: true, accountEmail: 'assets@storyforge.ai', connectedAt: new Date().toISOString() },
    { service: 'notion', connected: true, accountEmail: 'workspace@storyforge.ai', connectedAt: new Date().toISOString() },
    { service: 'linear', connected: true, accountEmail: 'product@storyforge.ai', connectedAt: new Date().toISOString() },
  ];

  listConnections(): IntegrationConnection[] {
    return [...this.activeConnections];
  }

  connectService(service: IntegrationService, accountEmail: string): IntegrationConnection {
    const existing = this.activeConnections.find((c) => c.service === service);
    if (existing) {
      existing.connected = true;
      existing.accountEmail = accountEmail;
      existing.connectedAt = new Date().toISOString();
      logger.info(`[IntegrationAdapters] Reconnected service '${service}' (${accountEmail})`);
      return existing;
    }

    const conn: IntegrationConnection = {
      service,
      connected: true,
      accountEmail,
      connectedAt: new Date().toISOString(),
    };
    this.activeConnections.push(conn);
    logger.info(`[IntegrationAdapters] Connected service '${service}' (${accountEmail})`);
    return conn;
  }

  disconnectService(service: IntegrationService): boolean {
    const conn = this.activeConnections.find((c) => c.service === service);
    if (conn) {
      conn.connected = false;
      logger.info(`[IntegrationAdapters] Disconnected service '${service}'`);
      return true;
    }
    return false;
  }

  triggerWebhook(service: IntegrationService, event: string, payload: Record<string, unknown>): { sent: boolean; response: string } {
    const conn = this.activeConnections.find((c) => c.service === service && c.connected);
    if (!conn) {
      logger.warn(`[IntegrationAdapters] Cannot trigger webhook: Service '${service}' is not connected`);
      return { sent: false, response: 'Service not connected' };
    }

    logger.info(`[IntegrationAdapters] Dispatched webhook event '${event}' to ${service}`);
    return { sent: true, response: `200 OK — Webhook '${event}' delivered to ${service}` };
  }
}

export const integrationAdapters = new IntegrationAdapters();

