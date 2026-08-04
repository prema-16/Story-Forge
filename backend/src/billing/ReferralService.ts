import { creditEngine } from './CreditEngine';
import { logger } from '../config/logger';

export interface ReferralCodeInfo {
  code: string;
  userId: string;
  totalReferredCount: number;
  bonusCreditsEarned: number;
}

export class ReferralService {
  private userCodes = new Map<string, string>(); // userId -> code
  private codeOwners = new Map<string, string>(); // code -> userId
  private referralStats = new Map<string, { count: number; credits: number }>();

  getOrCreateReferralCode(userId: string): string {
    if (this.userCodes.has(userId)) {
      return this.userCodes.get(userId)!;
    }

    const code = `SF_REF_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.userCodes.set(userId, code);
    this.codeOwners.set(code, userId);
    this.referralStats.set(userId, { count: 0, credits: 0 });

    logger.info(`[ReferralService] Created referral code '${code}' for user ${userId}`);
    return code;
  }

  async processReferral(referralCode: string, newUserId: string): Promise<{ success: boolean; bonusGranted: number }> {
    const referrerId = this.codeOwners.get(referralCode.toUpperCase());
    if (!referrerId || referrerId === newUserId) {
      return { success: false, bonusGranted: 0 };
    }

    const bonusAmount = 200; // 200 bonus credits for both referrer & referee

    // Grant credits to referrer
    await creditEngine.addBonusCredits(referrerId, bonusAmount, `Referral reward for inviting user ${newUserId}`);
    // Grant credits to referee
    await creditEngine.addBonusCredits(newUserId, bonusAmount, `Welcome referral bonus code ${referralCode}`);

    const stats = this.referralStats.get(referrerId) || { count: 0, credits: 0 };
    stats.count += 1;
    stats.credits += bonusAmount;
    this.referralStats.set(referrerId, stats);

    logger.info(`[ReferralService] Referral code '${referralCode}' redeemed by ${newUserId}. Granted ${bonusAmount} credits to ${referrerId} and ${newUserId}`);
    return { success: true, bonusGranted: bonusAmount };
  }

  getReferralStats(userId: string): { code: string; totalReferredCount: number; bonusCreditsEarned: number } {
    const code = this.getOrCreateReferralCode(userId);
    const stats = this.referralStats.get(userId) || { count: 0, credits: 0 };
    return {
      code,
      totalReferredCount: stats.count,
      bonusCreditsEarned: stats.credits,
    };
  }
}

export const referralService = new ReferralService();
