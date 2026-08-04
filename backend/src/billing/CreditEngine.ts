import mongoose from 'mongoose';
import { CreditModel, ICreditDoc } from '../models/Credit';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { logger } from '../config/logger';

export interface CreditBalance {
  remainingCredits: number;
  usedCredits: number;
  monthlyCredits: number;
  bonusCredits: number;
  totalCredits: number;
}

export class CreditEngine {
  getPlanCredits(plan: string): number {
    switch (plan.toLowerCase()) {
      case 'free':
        return 100;
      case 'starter':
        return 500;
      case 'creator':
        return 2000;
      case 'professional':
      case 'pro':
        return 5000;
      case 'enterprise':
        return 50000;
      default:
        return 100;
    }
  }

  async getBalance(userId: string): Promise<CreditBalance> {
    const doc = await CreditModel.findOne({ userId });
    if (!doc) {
      return {
        remainingCredits: 100,
        usedCredits: 0,
        monthlyCredits: 100,
        bonusCredits: 0,
        totalCredits: 100,
      };
    }
    return {
      remainingCredits: doc.remainingCredits,
      usedCredits: doc.usedCredits,
      monthlyCredits: doc.monthlyCredits,
      bonusCredits: doc.bonusCredits,
      totalCredits: doc.totalCredits,
    };
  }

  async allocateSubscriptionCredits(userId: string, plan: string): Promise<CreditBalance> {
    const monthlyCredits = this.getPlanCredits(plan);
    const existing = await CreditModel.findOne({ userId });

    const bonusCredits = existing ? existing.bonusCredits : 0;
    const remainingCredits = monthlyCredits + bonusCredits;
    const totalCredits = remainingCredits;

    const balanceBefore = existing ? existing.remainingCredits : 0;

    const updated = await CreditModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          monthlyCredits,
          remainingCredits,
          totalCredits,
          usedCredits: 0,
          plan,
        },
      },
      { upsert: true, new: true }
    );

    await CreditTransactionModel.create({
      userId,
      type: 'allocation',
      amount: monthlyCredits,
      balanceBefore,
      balanceAfter: updated.remainingCredits,
      reason: `Allocated monthly credits for plan '${plan}'`,
    });

    logger.info(`[CreditEngine] Allocated ${monthlyCredits} credits to user ${userId} for plan '${plan}'`);

    return {
      remainingCredits: updated.remainingCredits,
      usedCredits: updated.usedCredits,
      monthlyCredits: updated.monthlyCredits,
      bonusCredits: updated.bonusCredits,
      totalCredits: updated.totalCredits,
    };
  }

  async addBonusCredits(userId: string, amount: number, reason: string): Promise<CreditBalance> {
    const existing = await CreditModel.findOne({ userId });
    const balanceBefore = existing ? existing.remainingCredits : 100;

    const updated = await CreditModel.findOneAndUpdate(
      { userId },
      {
        $inc: {
          bonusCredits: amount,
          remainingCredits: amount,
          totalCredits: amount,
        },
      },
      { upsert: true, new: true }
    );

    await CreditTransactionModel.create({
      userId,
      type: 'bonus',
      amount,
      balanceBefore,
      balanceAfter: updated.remainingCredits,
      reason: reason || 'Bonus credits granted',
    });

    logger.info(`[CreditEngine] Added ${amount} bonus credits to user ${userId} (Reason: ${reason})`);

    return {
      remainingCredits: updated.remainingCredits,
      usedCredits: updated.usedCredits,
      monthlyCredits: updated.monthlyCredits,
      bonusCredits: updated.bonusCredits,
      totalCredits: updated.totalCredits,
    };
  }

  async deductCredits(
    userId: string,
    amount: number,
    reason = 'Credit consumption'
  ): Promise<{ success: boolean; remaining: number }> {
    const session = await mongoose.startSession().catch(() => null);

    try {
      if (session) {
        let success = false;
        let remaining = 0;

        await session.withTransaction(async () => {
          const doc = await CreditModel.findOne({ userId }).session(session);
          const currentRemaining = doc ? doc.remainingCredits : 100;

          if (currentRemaining < amount) {
            success = false;
            remaining = currentRemaining;
            return;
          }

          const balanceBefore = currentRemaining;
          const balanceAfter = currentRemaining - amount;

          await CreditModel.findOneAndUpdate(
            { userId },
            { $inc: { remainingCredits: -amount, usedCredits: amount } },
            { session }
          );

          await CreditTransactionModel.create(
            [
              {
                userId,
                type: 'deduction',
                amount,
                balanceBefore,
                balanceAfter,
                reason,
              },
            ],
            { session }
          );

          success = true;
          remaining = balanceAfter;
        });

        await session.endSession();
        if (!success) {
          logger.warn(`[CreditEngine] Insufficient credits for user ${userId}: requested ${amount}`);
        }
        return { success, remaining };
      }
    } catch (err) {
      logger.warn('[CreditEngine] Transaction failed, falling back to atomic query:', (err as Error).message);
    }

    // Standalone / Non-replica set fallback
    const doc = await CreditModel.findOne({ userId });
    const currentRemaining = doc ? doc.remainingCredits : 100;

    if (currentRemaining < amount) {
      return { success: false, remaining: currentRemaining };
    }

    const updated = await CreditModel.findOneAndUpdate(
      { userId, remainingCredits: { $gte: amount } },
      { $inc: { remainingCredits: -amount, usedCredits: amount } },
      { new: true }
    );

    if (!updated) {
      return { success: false, remaining: currentRemaining };
    }

    await CreditTransactionModel.create({
      userId,
      type: 'deduction',
      amount,
      balanceBefore: currentRemaining,
      balanceAfter: updated.remainingCredits,
      reason,
    });

    logger.info(`[CreditEngine] Deducted ${amount} credits from user ${userId} (Remaining: ${updated.remainingCredits})`);
    return { success: true, remaining: updated.remainingCredits };
  }
}

export const creditEngine = new CreditEngine();
