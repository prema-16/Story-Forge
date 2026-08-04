export interface OrderOptions {
  amount: number; // In smallest currency unit (e.g. paise for INR, cents for USD)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  provider: string;
}

export interface SubscriptionOptions {
  planId: string;
  customerId?: string;
  totalCount?: number;
  quantity?: number;
  notes?: Record<string, string>;
}

export interface SubscriptionResult {
  subscriptionId: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  provider: string;
}

export interface RefundResult {
  refundId: string;
  paymentId: string;
  amount: number;
  status: string;
  provider: string;
}

export interface PaymentProvider {
  readonly providerName: string;

  createOrder(options: OrderOptions): Promise<OrderResult>;
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
  createSubscription(options: SubscriptionOptions): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string, atPeriodEnd?: boolean): Promise<boolean>;
  pauseSubscription(subscriptionId: string): Promise<boolean>;
  resumeSubscription(subscriptionId: string): Promise<boolean>;
  processRefund(paymentId: string, amount?: number, reason?: string): Promise<RefundResult>;
  verifyWebhookSignature(body: string, signature: string, secret: string): boolean;
}
