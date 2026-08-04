import { razorpayProvider } from './providers/RazorpayProvider';
import { creditEngine } from './CreditEngine';
import { logger } from '../config/logger';

export class WebhookService {
  private processedEvents = new Set<string>();

  async processRazorpayWebhook(rawBody: string, signature: string, secret?: string): Promise<{ success: boolean; event?: string }> {
    // 1. Signature Verification
    const isValid = razorpayProvider.verifyWebhookSignature(rawBody, signature, secret || '');
    if (!isValid && process.env.NODE_ENV === 'production') {
      logger.warn(`[WebhookService] Invalid webhook signature received!`);
      return { success: false };
    }

    try {
      const payload = JSON.parse(rawBody);
      const event = payload.event;
      const eventId = payload.entity_id || payload.contains?.[0] || `evt_${Date.now()}`;

      // 2. Idempotency Check
      if (this.processedEvents.has(eventId)) {
        logger.info(`[WebhookService] Event ${eventId} already processed (idempotent skip)`);
        return { success: true, event };
      }
      this.processedEvents.add(eventId);

      logger.info(`[WebhookService] Processing Razorpay webhook event '${event}'`);

      // 3. Event Router
      switch (event) {
        case 'payment.captured': {
          const payment = payload.payload?.payment?.entity;
          if (payment) {
            const userId = payment.notes?.userId || 'user_default';
            const amountPaise = payment.amount || 0;
            logger.info(`[WebhookService] Payment captured: ₹${amountPaise / 100} for user ${userId}`);
          }
          break;
        }

        case 'subscription.activated':
        case 'subscription.created': {
          const sub = payload.payload?.subscription?.entity;
          if (sub) {
            const userId = sub.notes?.userId || 'user_default';
            const plan = sub.plan_id || 'starter';
            await creditEngine.allocateSubscriptionCredits(userId, plan);
            logger.info(`[WebhookService] Subscription activated for user ${userId} on plan '${plan}'`);
          }
          break;
        }

        case 'subscription.cancelled': {
          const sub = payload.payload?.subscription?.entity;
          if (sub) {
            const userId = sub.notes?.userId || 'user_default';
            logger.info(`[WebhookService] Subscription cancelled for user ${userId}`);
          }
          break;
        }

        case 'invoice.paid': {
          logger.info(`[WebhookService] Invoice paid event processed`);
          break;
        }

        default:
          logger.info(`[WebhookService] Unhandled event '${event}' logged`);
      }

      return { success: true, event };
    } catch (err) {
      logger.error(`[WebhookService] Failed to process webhook body:`, err);
      return { success: false };
    }
  }
}

export const webhookService = new WebhookService();
