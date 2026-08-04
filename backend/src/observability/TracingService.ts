import { logger } from '../config/logger';

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  service: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  tags: Record<string, string | number | boolean>;
  status: 'ok' | 'error';
  error?: string;
}

export class TracingService {
  private activeSpans = new Map<string, TraceSpan>();
  private completedSpans: TraceSpan[] = [];

  startSpan(operationName: string, service: string, parentSpanId?: string): TraceSpan {
    const span: TraceSpan = {
      traceId: parentSpanId ? this.getTraceIdFromSpan(parentSpanId) : this.generateId('trace'),
      spanId: this.generateId('span'),
      parentSpanId,
      operationName,
      service,
      startTime: Date.now(),
      tags: {},
      status: 'ok',
    };
    this.activeSpans.set(span.spanId, span);
    return span;
  }

  finishSpan(spanId: string, error?: string): TraceSpan | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    if (error) {
      span.status = 'error';
      span.error = error;
    }

    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);
    if (this.completedSpans.length > 5000) this.completedSpans.shift();

    if (span.durationMs > 200) {
      logger.warn(`[TracingService] SLOW SPAN: '${span.operationName}' (${span.service}) took ${span.durationMs}ms`);
    }

    return span;
  }

  setTag(spanId: string, key: string, value: string | number | boolean): void {
    const span = this.activeSpans.get(spanId);
    if (span) span.tags[key] = value;
  }

  getTrace(traceId: string): TraceSpan[] {
    return this.completedSpans.filter((s) => s.traceId === traceId);
  }

  getSlowTraces(thresholdMs = 200): TraceSpan[] {
    return this.completedSpans.filter((s) => (s.durationMs || 0) > thresholdMs);
  }

  getErrorTraces(): TraceSpan[] {
    return this.completedSpans.filter((s) => s.status === 'error');
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  private getTraceIdFromSpan(spanId: string): string {
    const parent = this.activeSpans.get(spanId) || this.completedSpans.find((s) => s.spanId === spanId);
    return parent?.traceId || this.generateId('trace');
  }

  getSummary(): Record<string, unknown> {
    const errored = this.getErrorTraces().length;
    const slow = this.getSlowTraces().length;
    const avgDuration = this.completedSpans.reduce((s, sp) => s + (sp.durationMs || 0), 0) / Math.max(1, this.completedSpans.length);

    return {
      completedSpans: this.completedSpans.length,
      activeSpans: this.activeSpans.size,
      erroredSpans: errored,
      slowSpans: slow,
      avgDurationMs: Math.round(avgDuration),
    };
  }
}

export const tracingService = new TracingService();
