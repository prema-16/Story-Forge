import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditDoc extends Document {
  userId: string;
  remainingCredits: number;
  usedCredits: number;
  monthlyCredits: number;
  bonusCredits: number;
  totalCredits: number;
  plan: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CreditSchema = new Schema<ICreditDoc>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    remainingCredits: { type: Number, required: true, default: 100, min: 0 },
    usedCredits: { type: Number, required: true, default: 0, min: 0 },
    monthlyCredits: { type: Number, required: true, default: 100, min: 0 },
    bonusCredits: { type: Number, required: true, default: 0, min: 0 },
    totalCredits: { type: Number, required: true, default: 100, min: 0 },
    plan: { type: String, default: 'free' },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const CreditModel = mongoose.models.Credit || mongoose.model<ICreditDoc>('Credit', CreditSchema);
