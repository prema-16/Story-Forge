import { logger } from '../config/logger';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
}

export class LogAggregator {
  private logs: LogEntry[] = [];
  private readonly maxBuffer = 10000;

  ingest(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxBuffer) {
      this.logs.shift();
    }
  }

  query(filter: { service?: string; level?: string; search?: string; limit?: number }): LogEntry[] {
    let result = [...this.logs];
    if (filter.service) {
      result = result.filter((l) => l.service === filter.service);
    }
    if (filter.level) {
      result = result.filter((l) => l.level === filter.level);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((l) => l.message.toLowerCase().includes(q));
    }
    return result.slice(-(filter.limit || 100));
  }

  exportLokiFormat(): string {
    return JSON.stringify({
      streams: [
        {
          stream: { app: 'storyforge' },
          values: this.logs.slice(-100).map((l) => [String(new Date(l.timestamp).getTime() * 1000000), l.message]),
        },
      ],
    });
  }
}

export const logAggregator = new LogAggregator();
