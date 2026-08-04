import { logger } from '../config/logger';

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_credits';
  discountValue: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  validFrom: Date;
  validTill?: Date;
  isActive: boolean;
}

export class CouponService {
  private coupons = new Map<string, Coupon>();

  constructor() {
    // Default system coupons
    this.addCoupon({
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20, // 20% off
      timesRedeemed: 0,
      validFrom: new Date(),
      isActive: true,
    });
    this.addCoupon({
      code: 'STARTAI500',
      discountType: 'free_credits',
      discountValue: 500, // 500 free credits
      timesRedeemed: 0,
      validFrom: new Date(),
      isActive: true,
    });
  }

  addCoupon(coupon: Coupon): void {
    this.coupons.set(coupon.code.toUpperCase(), coupon);
    logger.info(`[CouponService] Added coupon '${coupon.code}'`);
  }

  validateCoupon(code: string): { isValid: boolean; coupon?: Coupon; reason?: string } {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon || !coupon.isActive) {
      return { isValid: false, reason: 'Invalid or inactive coupon code' };
    }

    if (coupon.validTill && coupon.validTill < new Date()) {
      return { isValid: false, reason: 'Coupon code has expired' };
    }

    if (coupon.maxRedemptions && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return { isValid: false, reason: 'Coupon code usage limit reached' };
    }

    return { isValid: true, coupon };
  }

  redeemCoupon(code: string): Coupon | null {
    const { isValid, coupon } = this.validateCoupon(code);
    if (!isValid || !coupon) return null;

    coupon.timesRedeemed += 1;
    this.coupons.set(coupon.code, coupon);
    logger.info(`[CouponService] Coupon '${code}' redeemed (timesRedeemed: ${coupon.timesRedeemed})`);
    return coupon;
  }
}

export const couponService = new CouponService();
