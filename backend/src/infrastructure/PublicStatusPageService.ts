import { logger } from '../config/logger';

export type IncidentStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage';

export interface ServiceStatus {
  name: string;
  status: IncidentStatus;
  uptimePct: number;
  lastIncidentAt?: string;
  latencyMs?: number;
}

export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affectedServices: string[];
  createdAt: string;
  resolvedAt?: string;
  updates: Array<{ timestamp: string; message: string }>;
}

export class PublicStatusPageService {
  private services: ServiceStatus[] = [
    { name: 'API Gateway', status: 'operational', uptimePct: 99.98, latencyMs: 142 },
    { name: 'AI Generation Engine', status: 'operational', uptimePct: 99.95, latencyMs: 1820 },
    { name: 'Video Rendering Pipeline', status: 'operational', uptimePct: 99.92, latencyMs: 0 },
    { name: 'Media Storage & CDN', status: 'operational', uptimePct: 100, latencyMs: 18 },
    { name: 'Real-Time Collaboration (CRDT)', status: 'operational', uptimePct: 99.97, latencyMs: 48 },
    { name: 'Enterprise Marketplace', status: 'operational', uptimePct: 99.99, latencyMs: 95 },
    { name: 'Authentication & Identity', status: 'operational', uptimePct: 100, latencyMs: 65 },
    { name: 'Publishing Pipeline', status: 'operational', uptimePct: 99.90, latencyMs: 0 },
  ];

  private incidents: Incident[] = [];

  getStatusPage(): { overallStatus: IncidentStatus; services: ServiceStatus[]; activeIncidents: Incident[] } {
    const hasOutage = this.services.some((s) => s.status === 'major_outage');
    const hasPartial = this.services.some((s) => s.status === 'partial_outage');
    const hasDegraded = this.services.some((s) => s.status === 'degraded');

    const overallStatus: IncidentStatus = hasOutage ? 'major_outage' : hasPartial ? 'partial_outage' : hasDegraded ? 'degraded' : 'operational';
    const activeIncidents = this.incidents.filter((i) => i.status !== 'resolved');

    return { overallStatus, services: [...this.services], activeIncidents };
  }

  createIncident(title: string, affectedServices: string[]): Incident {
    const incident: Incident = {
      id: `inc_${Date.now()}`,
      title,
      status: 'investigating',
      affectedServices,
      createdAt: new Date().toISOString(),
      updates: [{ timestamp: new Date().toISOString(), message: 'Incident opened — investigating' }],
    };
    this.incidents.push(incident);
    logger.warn(`[PublicStatusPageService] Incident created: '${title}' affecting ${affectedServices.join(', ')}`);
    return incident;
  }

  resolveIncident(incidentId: string): boolean {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) return false;
    incident.status = 'resolved';
    incident.resolvedAt = new Date().toISOString();
    incident.updates.push({ timestamp: incident.resolvedAt, message: 'Incident resolved — all systems operational' });
    logger.info(`[PublicStatusPageService] Incident '${incidentId}' resolved`);
    return true;
  }

  getUptimeSummary(): { overall30DayUptime: number; services: Array<{ name: string; uptime: number }> } {
    const overall = this.services.reduce((sum, s) => sum + s.uptimePct, 0) / this.services.length;
    return {
      overall30DayUptime: Math.round(overall * 100) / 100,
      services: this.services.map((s) => ({ name: s.name, uptime: s.uptimePct })),
    };
  }
}

export const publicStatusPageService = new PublicStatusPageService();
