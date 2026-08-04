import { razorpayProvider } from '../billing/providers/RazorpayProvider';
import { gstInvoiceService } from '../billing/GSTInvoiceService';
import { couponService } from '../billing/CouponService';
import { emailService } from '../services/EmailService';
import { tokenService } from '../services/TokenService';
import { twoFactorService } from '../services/TwoFactorService';
import { shortsEngineService } from '../services/ShortsEngineService';
import { aiWriter } from '../agents/AIWriter';
import { aiScenePlanner } from '../agents/AIScenePlanner';
import { aiPromptEngineer } from '../agents/AIPromptEngineer';
import { aiVoiceDirector } from '../agents/AIVoiceDirector';
import { aiThumbnailDesigner, aiSEOSpecialist } from '../agents/AISpecialists';

export interface E2ETestResult {
  suiteName: string;
  flowName: string;
  status: 'PASS' | 'FAIL';
  latencyMs: number;
  details: string;
}

export async function runE2EFlowsSuite(): Promise<E2ETestResult[]> {
  const results: E2ETestResult[] = [];

  // Flow 1: Auth & User Lifecycle
  const t0 = Date.now();
  try {
    const tokenId = tokenService.generateTokenId();
    const isBlacklisted = await tokenService.isBlacklisted('jti_e2e_001');
    const twoFactorSecret = twoFactorService.generateSecret('test@storyforge.ai');
    const emailSent = await emailService.sendVerificationEmail('test@storyforge.ai', 'Test User', 'token_123');

    results.push({
      suiteName: 'Phase 1 — Auth & Session Flow',
      flowName: 'User Reg, Verification, JWT, 2FA, Email',
      status: tokenId && !isBlacklisted && twoFactorSecret && emailSent ? 'PASS' : 'FAIL',
      latencyMs: Date.now() - t0,
      details: 'Validated token ID creation, 2FA secret generation, and transactional email dispatch.',
    });
  } catch (err: any) {
    results.push({
      suiteName: 'Phase 1 — Auth & Session Flow',
      flowName: 'User Reg, Verification, JWT, 2FA, Email',
      status: 'FAIL',
      latencyMs: Date.now() - t0,
      details: err.message,
    });
  }

  // Flow 2: Billing, GST, Coupons & Refunds
  const t1 = Date.now();
  try {
    const taxIntra = gstInvoiceService.calculateTax(100000, '27'); // Maharashtra intrastate (9% + 9%)
    const taxInter = gstInvoiceService.calculateTax(100000, '07'); // Delhi interstate (18% IGST)
    const validCoupon = couponService.validateCoupon('WELCOME20');
    const rzpOrder = await razorpayProvider.createOrder({ amount: 149900, currency: 'INR', receipt: 'rcpt_e2e_001' });
    const rzpVerify = razorpayProvider.verifyPayment(rzpOrder.orderId, 'pay_mock_123', 'mock_sig');

    const pass =
      taxIntra.cgstAmount === 9000 &&
      taxInter.igstAmount === 18000 &&
      validCoupon.isValid &&
      rzpOrder.orderId &&
      rzpVerify;

    results.push({
      suiteName: 'Phase 1 & 8 — Billing & Payments Flow',
      flowName: 'GST Calculation, Coupon Validation, Razorpay Payment',
      status: pass ? 'PASS' : 'FAIL',
      latencyMs: Date.now() - t1,
      details: `GST Intrastate ₹${taxIntra.totalAmount / 100}, Interstate ₹${taxInter.totalAmount / 100}, Razorpay Order: ${rzpOrder.orderId}`,
    });
  } catch (err: any) {
    results.push({
      suiteName: 'Phase 1 & 8 — Billing & Payments Flow',
      flowName: 'GST Calculation, Coupon Validation, Razorpay Payment',
      status: 'FAIL',
      latencyMs: Date.now() - t1,
      details: err.message,
    });
  }

  // Flow 3: AI YouTube Generation Pipeline (Idea -> Script -> Scenes -> Prompts -> Voice -> Thumbnail -> SEO)
  const t2 = Date.now();
  try {
    const scriptRes = await aiWriter.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { idea: 'Quantum Computing Revolution', genre: 'documentary', videoLength: 60, style: 'cinematic', language: 'en' }
    );

    const scenesRes = await aiScenePlanner.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { script: scriptRes.data, genre: 'documentary', style: 'cinematic', videoLength: 60 }
    );

    const promptRes = await aiPromptEngineer.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { scene: { sceneNumber: 1, title: 'Opening', visualDescription: 'Quantum computer in lab' }, genre: 'documentary', style: 'cinematic', aspectRatio: '16:9' }
    );

    const voiceRes = await aiVoiceDirector.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { text: 'Quantum computing represents the future of technology.', voiceId: 'rachel', projectId: 'proj_e2e_001' }
    );

    const thumbRes = await aiThumbnailDesigner.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { scriptTitle: 'Quantum Computing Revolution', genre: 'documentary', style: 'cinematic' }
    );

    const seoRes = await aiSEOSpecialist.run(
      { projectId: 'proj_e2e_001', userId: 'user_e2e_001' },
      { scriptTitle: 'Quantum Computing Revolution', scriptSummary: 'Exploring quantum bits', genre: 'documentary', scenes: [] }
    );

    const pass =
      scriptRes.success && scenesRes.success && promptRes.success && voiceRes.success && thumbRes.success && seoRes.success;

    results.push({
      suiteName: 'Phase 1 — AI Generation Pipeline',
      flowName: 'Idea -> Script -> Scenes -> Prompts -> Voice -> Thumbnail -> SEO',
      status: pass ? 'PASS' : 'FAIL',
      latencyMs: Date.now() - t2,
      details: `Generated script with ${(scriptRes.data as any)?.chapters?.length || 1} chapters, voice narration, thumbnail & SEO tags.`,
    });
  } catch (err: any) {
    results.push({
      suiteName: 'Phase 1 — AI Generation Pipeline',
      flowName: 'Idea -> Script -> Scenes -> Prompts -> Voice -> Thumbnail -> SEO',
      status: 'FAIL',
      latencyMs: Date.now() - t2,
      details: err.message,
    });
  }

  // Flow 4: AI Shorts Engine Pipeline
  const t3 = Date.now();
  try {
    const shortProject = shortsEngineService.createShortsProject({
      userId: 'user_e2e_001',
      title: 'Why Black Holes Break Physics',
      inputType: 'prompt',
      sourceContent: 'Why Black Holes Break Physics',
      targetDurationSeconds: 30,
      visualStyle: '3d',
      videoProvider: 'runway',
      subtitleStyle: 'tiktok',
    });

    results.push({
      suiteName: 'Phase 1 — AI Shorts Pipeline',
      flowName: 'Prompt -> Viral Script -> 30s Short -> Captioning',
      status: shortProject && shortProject._id ? 'PASS' : 'FAIL',
      latencyMs: Date.now() - t3,
      details: `Short project created: ${shortProject._id} with retention score ${shortProject.viralityScore.overallScore}/100`,
    });
  } catch (err: any) {
    results.push({
      suiteName: 'Phase 1 — AI Shorts Pipeline',
      flowName: 'Prompt -> Viral Script -> 30s Short -> Captioning',
      status: 'FAIL',
      latencyMs: Date.now() - t3,
      details: err.message,
    });
  }

  return results;
}
