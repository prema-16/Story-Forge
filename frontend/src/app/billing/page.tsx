'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, CheckCircle2, Star, Rocket, Building2,
  ArrowRight, Crown, Info, Shield,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/app-layout';
import { useAuthStore } from '../../store/authStore';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    currencySymbol: '₹',
    icon: Star,
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    border: 'rgba(255,255,255,0.1)',
    credits: 100,
    features: [
      '100 credits / month',
      '3 active projects',
      'GPT-4o Mini text model',
      'Standard image quality',
      'Community voice library',
      'MP4 export up to 720p',
    ],
    limitations: ['No custom voices', 'Watermark on exports', 'Standard queue'],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 799,
    priceYearly: 639,
    currencySymbol: '₹',
    icon: Zap,
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.1))',
    border: 'rgba(124,58,237,0.4)',
    credits: 500,
    popular: false,
    features: [
      '500 credits / month',
      '20 active projects',
      'GPT-4o text model',
      'HD image generation (DALL-E 3)',
      '20 premium voices (ElevenLabs)',
      'MP4 / WebM up to 1080p',
      'No watermark',
      'Faster rendering queue',
    ],
    limitations: [],
    cta: 'Upgrade to Starter',
    priceId: 'plan_starter_inr',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 1499,
    priceYearly: 1199,
    currencySymbol: '₹',
    icon: Rocket,
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(236,72,153,0.2))',
    border: 'rgba(124,58,237,0.6)',
    popular: true,
    credits: 2000,
    features: [
      '2,000 credits / month',
      'AI Shorts Studio unlimited',
      '4K video export',
      'All 50+ ElevenLabs voices',
      'Voice cloning (upload voice)',
      'YouTube direct publish',
      'Commercial License',
      'Priority GPU queue',
    ],
    limitations: [],
    cta: 'Upgrade to Creator',
    priceId: 'plan_creator_inr',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    priceYearly: 2399,
    currencySymbol: '₹',
    icon: Crown,
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(236,72,153,0.15))',
    border: 'rgba(245,158,11,0.5)',
    popular: false,
    credits: 5000,
    features: [
      '5,000 credits / month',
      'Team Workspace (5 seats)',
      'Developer API access',
      'Batch generation (up to 500 shorts)',
      'Priority 4K rendering',
      'Custom LUT color profiles',
      '24/7 Priority support',
    ],
    limitations: [],
    cta: 'Upgrade to Professional',
    priceId: 'plan_pro_inr',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    priceYearly: 7999,
    currencySymbol: '₹',
    icon: Building2,
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.15))',
    border: 'rgba(6,182,212,0.3)',
    credits: 50000,
    features: [
      '50,000 credits / month',
      'Unlimited team members',
      'Dedicated GPU render cluster',
      'SLA guarantee (99.9%)',
      'Custom AI agent training',
      'White-label portal option',
      'Dedicated account manager',
    ],
    limitations: [],
    cta: 'Contact Sales',
    href: 'mailto:enterprise@storyforge.ai',
  },
];

const CREDIT_PACKS = [
  { credits: 200, price: 199, label: 'Starter Pack', bonus: 0 },
  { credits: 600, price: 499, label: 'Creator Pack', bonus: 50 },
  { credits: 1500, price: 999, label: 'Pro Pack', bonus: 200, popular: true },
  { credits: 5000, price: 2499, label: 'Studio Pack', bonus: 1000 },
];

export default function BillingPage() {
  const { user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const currentPlan = (user as any)?.plan || 'enterprise';

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (plan.href) { window.open(plan.href, '_blank'); return; }
    if (!plan.priceId || plan.disabled) return;

    setIsProcessing(plan.id);
    try {
      const { api } = await import('../../lib/api');
      const priceId = billingPeriod === 'yearly'
        ? plan.priceId.replace('monthly', 'yearly')
        : plan.priceId;

      const { data } = await api.post<{ url: string }>('/payments/create-checkout', { priceId });
      if ((data as any).url) window.location.href = (data as any).url;
    } catch (err) {
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCreditPurchase = async (pack: typeof CREDIT_PACKS[0]) => {
    setIsProcessing(`pack-${pack.credits}`);
    try {
      const { api } = await import('../../lib/api');
      const { data } = await api.post<{ url: string }>('/payments/create-credit-purchase', {
        credits: pack.credits + pack.bonus,
        price: pack.price,
      });
      if ((data as any).url) window.location.href = (data as any).url;
    } catch {
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const displayPrice = (plan: typeof PLANS[0]) =>
    billingPeriod === 'yearly' ? plan.priceYearly : plan.price;

  return (
    <AppLayout title="Billing & Credits" subtitle="Manage your subscription and credit balance">
      <div className="billing-page">
        {/* Credit balance card */}
        <div className="credit-balance-card">
          <div className="balance-left">
            <div className="balance-icon">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="balance-label">Current Balance</p>
              <p className="balance-value">{user?.credits?.toLocaleString() ?? 0} credits</p>
              <p className="balance-plan">
                <Crown className="h-3 w-3" /> {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </p>
            </div>
          </div>
          <div className="balance-right">
            <div className="balance-meta">
              <span>Used this month</span>
              <span className="balance-used">{(user as any)?.creditsUsed || 0} credits</span>
            </div>
            <div className="balance-bar-track">
              <div className="balance-bar-fill" style={{
                width: `${Math.min(((user as any)?.creditsUsed || 0) / Math.max((user as any)?.creditsTotal || 1000, 1) * 100, 100)}%`
              }} />
            </div>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="billing-toggle-wrapper">
          <h2 className="section-h2">Choose Your Plan</h2>
          <div className="billing-toggle">
            {(['monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                className={`toggle-btn ${billingPeriod === period ? 'active' : ''}`}
                onClick={() => setBillingPeriod(period)}
              >
                {period === 'yearly' ? '🎉 Yearly (Save 20%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="plans-grid">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = displayPrice(plan);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                style={{
                  background: plan.gradient,
                  border: `1px solid ${plan.border}`,
                  '--plan-glow': plan.border,
                } as React.CSSProperties}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <Star className="h-3 w-3" /> Most Popular
                  </div>
                )}
                <div className="plan-header">
                  <div className="plan-icon-wrapper">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-credits">{plan.credits.toLocaleString()} credits/month</p>
                  </div>
                </div>
                <div className="plan-price">
                  {price === 0 ? (
                    <span className="price-free">Free</span>
                  ) : (
                    <>
                      <span className="price-dollar">$</span>
                      <span className="price-value">{price}</span>
                      <span className="price-period">/{billingPeriod === 'yearly' ? 'mo' : 'mo'}</span>
                    </>
                  )}
                  {billingPeriod === 'yearly' && price > 0 && (
                    <span className="price-billed">Billed annually</span>
                  )}
                </div>

                <div className="plan-features">
                  {plan.features.map((f) => (
                    <div key={f} className="feature-row">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`plan-cta ${isCurrentPlan ? 'current-cta' : 'upgrade-cta'}`}
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrentPlan || isProcessing === plan.id}
                >
                  {isProcessing === plan.id ? 'Redirecting...' : plan.cta}
                  {!isCurrentPlan && !isProcessing && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Credit top-up packs */}
        <section>
          <div className="section-header-row">
            <div>
              <h2 className="section-h2">Credit Top-Ups</h2>
              <p className="section-sub">One-time credit purchases — never expire</p>
            </div>
          </div>
          <div className="credit-packs-grid">
            {CREDIT_PACKS.map((pack, i) => (
              <motion.div
                key={pack.credits}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className={`credit-pack ${pack.popular ? 'pack-popular' : ''}`}
              >
                {pack.popular && <span className="pack-badge">Best Value</span>}
                <div className="pack-header">
                  <p className="pack-name">{pack.label}</p>
                  <p className="pack-credits">
                    {(pack.credits + pack.bonus).toLocaleString()} credits
                    {pack.bonus > 0 && <span className="pack-bonus">+{pack.bonus} bonus</span>}
                  </p>
                </div>
                <p className="pack-price">${pack.price}</p>
                <p className="pack-rate">${(pack.price / (pack.credits + pack.bonus) * 1000).toFixed(2)} per 1K credits</p>
                <button
                  className="pack-buy-btn"
                  onClick={() => handleCreditPurchase(pack)}
                  disabled={isProcessing === `pack-${pack.credits}`}
                >
                  {isProcessing === `pack-${pack.credits}` ? 'Processing...' : `Buy for $${pack.price}`}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust badges */}
        <div className="trust-row">
          {[
            { icon: Shield, text: 'Payments secured by Stripe' },
            { icon: CheckCircle2, text: 'Cancel anytime, no questions asked' },
            { icon: Info, text: 'Credits roll over for 90 days' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="trust-badge">
              <Icon className="h-3.5 w-3.5 text-emerald-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .billing-page { display: flex; flex-direction: column; gap: 32px; max-width: 1200px; }

        /* Balance card */
        .credit-balance-card {
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05));
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 18px;
        }
        .balance-left { display: flex; align-items: center; gap: 16px; }
        .balance-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.25); display: flex; align-items: center; justify-content: center; }
        .balance-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .balance-value { font-size: 32px; font-weight: 800; color: #fff; font-family: 'Space Grotesk', sans-serif; }
        .balance-plan { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(245,158,11,0.8); margin-top: 2px; }
        .balance-right { display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
        .balance-meta { display: flex; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.4); }
        .balance-used { font-weight: 700; color: rgba(255,255,255,0.7); }
        .balance-bar-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .balance-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444); border-radius: 3px; transition: width 0.5s ease; }

        /* Toggle */
        .billing-toggle-wrapper { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .section-h2 { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.02em; font-family: 'Space Grotesk', sans-serif; }
        .billing-toggle { display: flex; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; }
        .toggle-btn { padding: 6px 16px; border-radius: 9px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; background: transparent; color: rgba(255,255,255,0.4); font-family: 'Inter', sans-serif; }
        .toggle-btn.active { background: rgba(124,58,237,0.3); color: #a78bfa; }

        /* Plans */
        .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .plan-card {
          position: relative;
          padding: 24px; border-radius: 20px;
          display: flex; flex-direction: column; gap: 20px;
          transition: all 0.2s ease;
        }
        .plan-card:hover { transform: translateY(-2px); box-shadow: 0 0 40px var(--plan-glow, rgba(124,58,237,0.2)); }
        .plan-card.popular { order: -1; }
        .popular-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 4px;
          padding: 3px 12px; border-radius: 20px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          font-size: 10px; font-weight: 800; color: #fff; white-space: nowrap;
          letter-spacing: 0.04em;
        }
        .plan-header { display: flex; align-items: center; gap: 12px; }
        .plan-icon-wrapper { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); }
        .plan-name { font-size: 18px; font-weight: 800; color: #fff; font-family: 'Space Grotesk', sans-serif; }
        .plan-credits { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }
        .plan-price { display: flex; align-items: baseline; gap: 2px; }
        .price-free { font-size: 28px; font-weight: 800; color: rgba(255,255,255,0.5); }
        .price-dollar { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.6); align-self: flex-start; margin-top: 4px; }
        .price-value { font-size: 36px; font-weight: 900; color: #fff; font-family: 'Space Grotesk', sans-serif; line-height: 1; }
        .price-period { font-size: 14px; color: rgba(255,255,255,0.4); margin-left: 2px; }
        .price-billed { font-size: 10px; color: rgba(255,255,255,0.3); margin-left: 8px; align-self: flex-end; }
        .plan-features { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .feature-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(255,255,255,0.7); }
        .plan-cta {
          padding: 11px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .upgrade-cta { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; }
        .upgrade-cta:hover:not(:disabled) { background: linear-gradient(135deg, #8b5cf6, #7c3aed); transform: translateY(-1px); }
        .current-cta { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); cursor: default; }
        .plan-cta:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Credit packs */
        .section-header-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .section-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 3px; }
        .credit-packs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
        .credit-pack {
          position: relative;
          padding: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          display: flex; flex-direction: column; gap: 10px;
          transition: all 0.15s;
        }
        .credit-pack:hover { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.05); }
        .credit-pack.pack-popular { border-color: rgba(124,58,237,0.3); }
        .pack-badge {
          position: absolute; top: -8px; right: 16px;
          padding: 2px 8px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          font-size: 9px; font-weight: 800; color: #fff; letter-spacing: 0.04em;
        }
        .pack-name { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); }
        .pack-credits { font-size: 20px; font-weight: 800; color: #fff; font-family: 'Space Grotesk', sans-serif; display: flex; align-items: center; gap: 6px; }
        .pack-bonus { font-size: 11px; padding: 1px 6px; border-radius: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
        .pack-price { font-size: 28px; font-weight: 900; color: #fff; font-family: 'Space Grotesk', sans-serif; }
        .pack-rate { font-size: 10px; color: rgba(255,255,255,0.25); }
        .pack-buy-btn {
          padding: 9px; border-radius: 10px; border: none;
          background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
          margin-top: auto;
        }
        .pack-buy-btn:hover:not(:disabled) { background: rgba(124,58,237,0.35); }
        .pack-buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Trust */
        .trust-row { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding-top: 8px; }
        .trust-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.35); }
      `}</style>
    </AppLayout>
  );
}
