import mongoose, { Schema, Document } from 'mongoose';

// 1. Subscription
export interface ISubscriptionDoc extends Document {
  userId: string;
  organizationId?: string;
  plan: 'free' | 'starter' | 'creator' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'authenticated' | 'past_due' | 'paused' | 'cancelled' | 'completed';
  provider: string;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  pausedAt?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDoc>(
  {
    userId: { type: String, required: true, index: true },
    organizationId: { type: String, index: true },
    plan: { type: String, enum: ['free', 'starter', 'creator', 'professional', 'enterprise'], default: 'free' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    status: { type: String, enum: ['active', 'authenticated', 'past_due', 'paused', 'cancelled', 'completed'], default: 'active' },
    provider: { type: String, default: 'razorpay' },
    providerSubscriptionId: { type: String, index: true },
    providerCustomerId: { type: String },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    trialEnd: { type: Date },
    pausedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 2. Payment
export interface IPaymentDoc extends Document {
  orderId: string;
  paymentId?: string;
  userId: string;
  amount: number; // in paise or smallest unit
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  method?: 'upi' | 'card' | 'netbanking' | 'wallet' | 'other';
  upiVpa?: string;
  cardLast4?: string;
  bankName?: string;
  razorpaySignature?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDoc>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
    method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'other'] },
    upiVpa: { type: String },
    cardLast4: { type: String },
    bankName: { type: String },
    razorpaySignature: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

// 3. Invoice (GST Compliant)
export interface IInvoiceDoc extends Document {
  invoiceNumber: string;
  subscriptionId?: string;
  userId: string;
  customerName: string;
  customerGstin?: string;
  stateCode: string;
  sacCode: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  pdfUrl?: string;
  status: 'paid' | 'unpaid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoiceDoc>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    subscriptionId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerGstin: { type: String },
    stateCode: { type: String, default: '27' }, // Default Maharashtra
    sacCode: { type: String, default: '998314' }, // IT / AI Services SAC
    subtotal: { type: Number, required: true },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    pdfUrl: { type: String },
    status: { type: String, enum: ['paid', 'unpaid', 'refunded'], default: 'paid' },
  },
  { timestamps: true }
);

// 4. Coupon
export interface ICouponDoc extends Document {
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_credits';
  discountValue: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  validFrom: Date;
  validTill?: Date;
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema = new Schema<ICouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed_amount', 'free_credits'], required: true },
    discountValue: { type: Number, required: true },
    maxRedemptions: { type: Number },
    timesRedeemed: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTill: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 5. ReferralReward
export interface IReferralRewardDoc extends Document {
  referrerUserId: string;
  referredUserId: string;
  referralCode: string;
  bonusCreditsEarned: number;
  status: 'pending' | 'awarded';
  createdAt: Date;
}

const ReferralRewardSchema = new Schema<IReferralRewardDoc>(
  {
    referrerUserId: { type: String, required: true, index: true },
    referredUserId: { type: String, required: true, index: true },
    referralCode: { type: String, required: true },
    bonusCreditsEarned: { type: Number, default: 200 },
    status: { type: String, enum: ['pending', 'awarded'], default: 'awarded' },
  },
  { timestamps: true }
);

// Models exports
export const SubscriptionModel = mongoose.models.Subscription || mongoose.model<ISubscriptionDoc>('Subscription', SubscriptionSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model<IPaymentDoc>('Payment', PaymentSchema);
export const InvoiceModel = mongoose.models.Invoice || mongoose.model<IInvoiceDoc>('Invoice', InvoiceSchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model<ICouponDoc>('Coupon', CouponSchema);
export const ReferralRewardModel = mongoose.models.ReferralReward || mongoose.model<IReferralRewardDoc>('ReferralReward', ReferralRewardSchema);
