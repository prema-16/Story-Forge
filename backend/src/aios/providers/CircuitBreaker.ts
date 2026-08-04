import { logger } from '../../config/logger';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Failed requests to trip circuit (default: 5)
  resetTimeoutMs?: number;   // Time in open state before trying half-open (default: 30000ms)
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private nextAttemptTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(private readonly providerId: string, options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
  }

  getState(): CircuitState {
    if (this.state === 'open' && Date.now() >= this.nextAttemptTime) {
      this.state = 'half-open';
      logger.info(`[CircuitBreaker:${this.providerId}] Transitioned to HALF-OPEN state`);
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.getState();

    if (current === 'open') {
      throw new Error(`[CircuitBreaker:${this.providerId}] Circuit is OPEN. Provider temporarily unavailable.`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      logger.info(`[CircuitBreaker:${this.providerId}] Circuit recovered to CLOSED state`);
    }
  }

  onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
      logger.warn(`[CircuitBreaker:${this.providerId}] Circuit TRIPPED to OPEN state for ${this.resetTimeoutMs}ms`);
    }
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.nextAttemptTime = 0;
  }
}
