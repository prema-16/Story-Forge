import IORedis, { Redis } from 'ioredis';
import { getIORedisClient } from '../config/redis';
import { logger } from '../config/logger';
import type { SSEEvent, SSEEventType } from '@storyforge/shared';

// ─── Internal Event Shape ────────────────────────────────────────────────────

interface ProgressEvent {
  type: SSEEventType | 'log' | 'heartbeat';
  step?: string;
  jobId?: string | null;
  progress?: number;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp?: string;
}

type MessageListener = (event: ProgressEvent) => void;

// ─── PubSubService ────────────────────────────────────────────────────────────

/**
 * PubSubService — Redis Pub/Sub for real-time SSE event forwarding.
 *
 * Architecture:
 * - One shared publisher connection (getIORedisClient)
 * - One shared subscriber connection (shared across ALL SSE clients)
 * - Channel multiplexing: all channels share the same subscriber client
 * - Each SSE session registers a listener; cleanup on disconnect
 *
 * This replaces the previous pattern that created one IORedis connection
 * per SSE subscriber, which would exhaust Redis connections under load.
 */
class PubSubService {
  private publisher: Redis;
  private subscriber: Redis | null = null;
  /** Map of channel → Set of listener functions */
  private listeners: Map<string, Set<MessageListener>> = new Map();
  private isSubscriberSetup = false;

  constructor() {
    this.publisher = getIORedisClient();
  }

  // ─── Publisher ─────────────────────────────────────────────────────────────

  /**
   * Publish a progress event to a project's channel.
   * No-op if Redis is offline.
   */
  async publish(projectId: string, event: ProgressEvent): Promise<void> {
    try {
      if (this.publisher.status !== 'ready') return;
      const channel = this.channelFor(projectId);
      const payload = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
      await this.publisher.publish(channel, payload);
    } catch {
      logger.debug('[PubSub] Publish skipped (Redis offline)');
    }
  }

  // ─── Subscriber Pool ───────────────────────────────────────────────────────

  /**
   * Subscribe to a project's progress channel.
   * Uses a single shared subscriber connection (connection pool).
   * Returns an async unsubscribe function — call it on SSE client disconnect.
   */
  subscribe(projectId: string, onMessage: MessageListener): () => Promise<void> {
    const channel = this.channelFor(projectId);

    // Register listener
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(onMessage);

    // Ensure subscriber is connected and listening
    this.ensureSubscriber(channel);

    // Return unsubscribe function
    return async () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(onMessage);
        // If no more listeners on this channel, unsubscribe from Redis
        if (channelListeners.size === 0) {
          this.listeners.delete(channel);
          try {
            await this.subscriber?.unsubscribe(channel);
          } catch {
            // Subscriber may be disconnected already
          }
          logger.debug(`[PubSub] Unsubscribed from ${channel} (no more listeners)`);
        }
      }
    };
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private channelFor(projectId: string): string {
    return `project:${projectId}:progress`;
  }

  private ensureSubscriber(channel: string): void {
    // Bootstrap the shared subscriber connection once
    if (!this.subscriber) {
      this.subscriber = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: false,
        retryStrategy(times) {
          return Math.min(times * 1000, 10_000);
        },
      });

      this.subscriber.on('connect', () => {
        logger.info('[PubSub] Shared subscriber connected');
        this.isSubscriberSetup = true;
      });

      this.subscriber.on('error', (err: Error) => {
        logger.debug(`[PubSub] Subscriber error: ${err.message}`);
      });

      // Route incoming messages to the correct listener set
      this.subscriber.on('message', (_channel: string, message: string) => {
        const listeners = this.listeners.get(_channel);
        if (!listeners || listeners.size === 0) return;

        try {
          const event: ProgressEvent = JSON.parse(message);
          listeners.forEach((listener) => {
            try {
              listener(event);
            } catch (listenerErr) {
              logger.warn('[PubSub] Listener threw an error', listenerErr);
            }
          });
        } catch {
          logger.warn('[PubSub] Failed to parse pubsub message');
        }
      });
    }

    // Subscribe to the channel if not already (idempotent)
    if (this.subscriber.status === 'ready' || this.isSubscriberSetup) {
      this.subscriber.subscribe(channel, (err?: Error | null) => {
        if (err) logger.debug(`[PubSub] Subscribe failed for ${channel}: ${err.message}`);
        else logger.debug(`[PubSub] Subscribed to ${channel}`);
      });
    } else {
      // Queue subscribe once ready
      this.subscriber.once('connect', () => {
        this.subscriber!.subscribe(channel, (err?: Error | null) => {
          if (err) logger.debug(`[PubSub] Subscribe failed for ${channel}: ${err.message}`);
          else logger.debug(`[PubSub] Subscribed to ${channel}`);
        });
      });
    }
  }

  /** Gracefully disconnect both publisher and shared subscriber. */
  async disconnect(): Promise<void> {
    try {
      if (this.subscriber) {
        await this.subscriber.quit();
        this.subscriber = null;
      }
    } catch {
      // Ignore disconnect errors
    }
  }
}

export const pubSubService = new PubSubService();

/**
 * Convenience wrapper used by workers to publish progress events.
 */
export async function publishProgress(
  projectId: string,
  event: Omit<ProgressEvent, 'timestamp'>,
): Promise<void> {
  return pubSubService.publish(projectId, event as ProgressEvent);
}
