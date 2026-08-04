import { logger } from '../config/logger';

export type PlanTier = 'free' | 'creator' | 'pro' | 'studio' | 'enterprise';

export interface SubscriptionInfo {
  organizationId: string;
  plan: PlanTier;
  seats: number;
  monthlyCredits: number;
  creditsRemaining: number;
  renewalDate: string;
}

export class EnterpriseBillingService {
  private subscriptions = new Map<string, SubscriptionInfo>();

  constructor() {
    this.subscriptions.set('org_enterprise_1', {
      organizationId: 'org_enterprise_1',
      plan: 'enterprise',
      seats: 25,
      monthlyCredits: 50000,
      creditsRemaining: 42150,
      renewalDate: '2026-09-01T00:00:00.000Z',
    });
  }

  getSubscription(orgId: string): SubscriptionInfo {
    return (
      this.subscriptions.get(orgId) || {
        organizationId: orgId,
        plan: 'free',
        seats: 1,
        monthlyCredits: 100,
        creditsRemaining: 100,
        renewalDate: new Date().toISOString(),
      }
    );
  }

  consumeCredits(orgId: string, amount: number): { success: boolean; creditsRemaining: number } {
    const sub = this.getSubscription(orgId);
    if (sub.creditsRemaining < amount) {
      logger.warn(`[EnterpriseBillingService] Insufficient credits for org '${orgId}' (Requested: ${amount}, Remaining: ${sub.creditsRemaining})`);
      return { success: false, creditsRemaining: sub.creditsRemaining };
    }

    sub.creditsRemaining -= amount;
    this.subscriptions.set(orgId, sub);
    logger.info(`[EnterpriseBillingService] Consumed ${amount} credits for org '${orgId}' (${sub.creditsRemaining} remaining)`);
    return { success: true, creditsRemaining: sub.creditsRemaining };
  }

  upgradePlan(orgId: string, newPlan: PlanTier, additionalSeats = 0): SubscriptionInfo {
    const sub = this.getSubscription(orgId);
    sub.plan = newPlan;

    if (newPlan === 'enterprise') {
      sub.monthlyCredits = 50000;
      sub.seats = Math.max(25, sub.seats + additionalSeats);
    } else if (newPlan === 'studio') {
      sub.monthlyCredits = 20000;
      sub.seats = Math.max(10, sub.seats + additionalSeats);
    } else if (newPlan === 'pro') {
      sub.monthlyCredits = 5000;
      sub.seats = Math.max(3, sub.seats + additionalSeats);
    } else if (newPlan === 'creator') {
      sub.monthlyCredits = 1000;
      sub.seats = 1;
    }

    sub.creditsRemaining = sub.monthlyCredits;
    this.subscriptions.set(orgId, sub);
    logger.info(`[EnterpriseBillingService] Upgraded org '${orgId}' to plan '${newPlan}'`);
    return sub;
  }

  updateSeats(orgId: string, seats: number): SubscriptionInfo {
    const sub = this.getSubscription(orgId);
    sub.seats = seats;
    this.subscriptions.set(orgId, sub);
    logger.info(`[EnterpriseBillingService] Updated seat count for org '${orgId}' to ${seats}`);
    return sub;
  }
}

export const enterpriseBillingService = new EnterpriseBillingService();

