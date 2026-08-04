import { logger } from '../config/logger';

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  name: string;
  durationMs: number;
  statusCode: 'OK' | 'ERROR';
  attributes: Record<string, string | number | boolean>;
}

export class OpenTelemetryService {
  private activeTraces = new Map<string, TelemetrySpan[]>();

  startTrace(traceName: string): { traceId: string; spanId: string; endSpan: (attributes?: Record<string, any>) => TelemetrySpan } {
    const traceId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const spanId = `sp_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    logger.info(`[OpenTelemetryService] Started trace '${traceName}' (${traceId})`);

    const endSpan = (attributes: Record<string, any> = {}): TelemetrySpan => {
      const span: TelemetrySpan = {
        traceId,
        spanId,
        name: traceName,
        durationMs: Date.now() - startTime,
        statusCode: 'OK',
        attributes: {
          environment: process.env.NODE_ENV || 'production',
          ...attributes,
        },
      };

      const spans = this.activeTraces.get(traceId) || [];
      spans.push(span);
      this.activeTraces.set(traceId, spans);

      logger.info(`[OpenTelemetryService] Ended trace '${traceName}' in ${span.durationMs}ms`);
      return span;
    };

    return { traceId, spanId, endSpan };
  }

  getTrace(traceId: string): TelemetrySpan[] {
    return this.activeTraces.get(traceId) || [];
  }
}

export const openTelemetryService = new OpenTelemetryService();
