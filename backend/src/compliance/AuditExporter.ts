import { logger } from '../config/logger';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  resource: string;
  ip: string;
  result: 'success' | 'failure';
}

export class AuditExporter {
  exportToCSV(records: AuditRecord[]): string {
    const headers = 'ID,Timestamp,Actor,Action,Resource,IP,Result\n';
    const rows = records.map((r) => `${r.id},${r.timestamp},${r.actorId},"${r.action}","${r.resource}",${r.ip},${r.result}`).join('\n');
    logger.info(`[AuditExporter] Exported ${records.length} audit records to CSV`);
    return headers + rows;
  }

  exportToJSON(records: AuditRecord[]): string {
    logger.info(`[AuditExporter] Exported ${records.length} audit records to JSON`);
    return JSON.stringify({ exportDate: new Date().toISOString(), count: records.length, records }, null, 2);
  }
}

export const auditExporter = new AuditExporter();
