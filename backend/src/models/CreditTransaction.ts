import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditTransactionDoc extends Document {
  userId: string;
  type: 'allocation' | 'deduction' | 'bonus' | 'expiry' | 'refund';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransactionDoc>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['allocation', 'deduction', 'bonus', 'expiry', 'refund'],
      required: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    reason: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const CreditTransactionModel =
  mongoose.models.CreditTransaction ||
  mongoose.model<ICreditTransactionDoc>('CreditTransaction', CreditTransactionSchema);
