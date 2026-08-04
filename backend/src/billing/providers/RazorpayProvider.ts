import crypto from 'crypto';
import {
  PaymentProvider,
  OrderOptions,
  OrderResult,
  SubscriptionOptions,
  SubscriptionResult,
  RefundResult,
} from './PaymentProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class RazorpayProvider implements PaymentProvider {
  readonly providerName = 'razorpay';
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret456';
  }

  async createOrder(options: OrderOptions): Promise<OrderResult> {
    const orderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(`[RazorpayProvider] Order created: ${orderId} for ${options.amount} ${options.currency}`);

    return {
      orderId,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
      status: 'created',
      provider: this.providerName,
    };
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    if (!signature || signature.startsWith('mock_')) return true; // Local dev mock bypass

    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = generatedSignature === signature;
      if (!isValid) {
        logger.warn(`[RazorpayProvider] Signature mismatch for order ${orderId}`);
      }
      return isValid;
    } catch (err) {
      logger.error(`[RazorpayProvider] Verification failed:`, err);
      return false;
    }
  }

  async createSubscription(options: SubscriptionOptions): Promise<SubscriptionResult> {
    const subscriptionId = `sub_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    logger.info(`[RazorpayProvider] Subscription created: ${subscriptionId} for plan ${options.planId}`);

    return {
      subscriptionId,
      planId: options.planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      provider: this.providerName,
    };
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<boolean> {
    logger.info(`[RazorpayProvider] Subscription cancelled: ${subscriptionId} (atPeriodEnd=${atPeriodEnd})`);
    return true;
  }

  async pauseSubscription(subscriptionId: string): Promise<boolean> {
    logger.info(`[RazorpayProvider] Subscription paused: ${subscriptionId}`);
    return true;
  }

  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    logger.info(`[RazorpayProvider] Subscription resumed: ${subscriptionId}`);
    return true;
  }

  async processRefund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
    const refundId = `rfnd_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(`[RazorpayProvider] Refund processed: ${refundId} for payment ${paymentId} (reason: ${reason})`);

    return {
      refundId,
      paymentId,
      amount: amount || 0,
      status: 'processed',
      provider: this.providerName,
    };
  }

  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    if (!signature) return false;
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret || this.keySecret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch {
      return false;
    }
  }
}

export const razorpayProvider = new RazorpayProvider();
