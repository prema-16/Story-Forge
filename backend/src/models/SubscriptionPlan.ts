import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlanDoc extends Document {
  slug: 'free' | 'starter' | 'creator' | 'professional' | 'enterprise';
  name: string;
  priceMonthly: number; // in INR paise (e.g. 149900 for ₹1,499.00)
  priceYearly: number;
  credits: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlanDoc>(
  {
    slug: {
      type: String,
      enum: ['free', 'starter', 'creator', 'professional', 'enterprise'],
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    priceMonthly: { type: Number, required: true },
    priceYearly: { type: Number, required: true },
    credits: { type: Number, required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SubscriptionPlanModel =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlanDoc>('SubscriptionPlan', SubscriptionPlanSchema);
