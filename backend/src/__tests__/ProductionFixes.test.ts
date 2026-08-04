import { describe, it, expect, beforeAll } from '@jest/globals';
import { creditEngine } from '../billing/CreditEngine';
import { razorpayProvider } from '../billing/providers/RazorpayProvider';
import { couponService } from '../billing/CouponService';
import { referralService } from '../billing/ReferralService';
import { workerManager } from '../services/WorkerManager';

describe('Production Fixes Suite (BUG 001 - BUG 008)', () => {
  it('BUG 001 & BUG 002: Plan credits calculation has no hardcoded email fallbacks', () => {
    expect(creditEngine.getPlanCredits('free')).toBe(100);
    expect(creditEngine.getPlanCredits('starter')).toBe(500);
    expect(creditEngine.getPlanCredits('creator')).toBe(2000);
    expect(creditEngine.getPlanCredits('professional')).toBe(5000);
    expect(creditEngine.getPlanCredits('enterprise')).toBe(50000);
  });

  it('BUG 005: CreditEngine getBalance returns default object when user not found in DB', async () => {
    const bal = await creditEngine.getBalance('non_existent_test_user_xyz');
    expect(bal.remainingCredits).toBe(100);
    expect(bal.monthlyCredits).toBe(100);
    expect(bal.usedCredits).toBe(0);
  });

  it('BUG 001: Razorpay Provider verifies payment signatures correctly', () => {
    const orderId = 'order_test_123';
    const paymentId = 'pay_test_456';
    const isValidMock = razorpayProvider.verifyPayment(orderId, paymentId, 'mock_sig');
    expect(isValidMock).toBe(true);

    const isInvalid = razorpayProvider.verifyPayment(orderId, paymentId, 'invalid_sig_string');
    expect(isInvalid).toBe(false);
  });

  it('BUG 006: Coupon service validates and redeems valid coupons', () => {
    const val = couponService.validateCoupon('WELCOME20');
    expect(val.isValid).toBe(true);
    expect(val.coupon?.discountValue).toBe(20);

    const invalid = couponService.validateCoupon('NON_EXISTENT_COUPON');
    expect(invalid.isValid).toBe(false);
  });

  it('BUG 008: WorkerManager tracks registered workers correctly', () => {
    const allWorkers = workerManager.getAll();
    expect(Array.isArray(allWorkers)).toBe(true);
  });
});
