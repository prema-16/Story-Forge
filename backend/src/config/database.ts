import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info('✅ MongoDB connected successfully');

    // Seed database items
    await seedSubscriptionPlans();
    await seedDemoUser();

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected — attempting to reconnect');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      isConnected = false;
    });
  } catch (err) {
    logger.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

async function seedSubscriptionPlans(): Promise<void> {
  try {
    const { SubscriptionPlanModel } = await import('../models/SubscriptionPlan');
    const count = await SubscriptionPlanModel.countDocuments();
    if (count === 0) {
      const plans = [
        {
          slug: 'free',
          name: 'Free Tier',
          priceMonthly: 0,
          priceYearly: 0,
          credits: 100,
          features: ['100 Monthly AI Credits', '720p Video Exports', 'Standard AI Voiceovers', 'Watermarked Outputs'],
          sortOrder: 1,
        },
        {
          slug: 'starter',
          name: 'Starter Plan',
          priceMonthly: 49900, // ₹499/mo
          priceYearly: 499000,
          credits: 500,
          features: ['500 Monthly AI Credits', '1080p Full HD Exports', 'Premium AI Voices', 'No Watermarks', 'Standard Queue Speed'],
          sortOrder: 2,
        },
        {
          slug: 'creator',
          name: 'Creator Plan',
          priceMonthly: 149900, // ₹1,499/mo
          priceYearly: 1499000,
          credits: 2000,
          features: ['2,000 Monthly AI Credits', '4K Ultra HD Exports', 'Custom Voice Cloning', 'Priority Generation Queue', 'YouTube Auto-Publishing'],
          sortOrder: 3,
        },
        {
          slug: 'professional',
          name: 'Professional Plan',
          priceMonthly: 499900, // ₹4,999/mo
          priceYearly: 4999000,
          credits: 5000,
          features: ['5,000 Monthly AI Credits', 'Dedicated Rendering Cluster', 'API Key Access', 'Multi-Track Studio', 'Commercial Rights'],
          sortOrder: 4,
        },
        {
          slug: 'enterprise',
          name: 'Enterprise Plan',
          priceMonthly: 999900, // ₹9,999/mo
          priceYearly: 9999000,
          credits: 50000,
          features: ['50,000 Monthly AI Credits', 'Unlimited Team Seats', 'Custom Model Fine-tuning', '24/7 Priority Support & SLA', 'Dedicated Account Manager'],
          sortOrder: 5,
        },
      ];
      await SubscriptionPlanModel.insertMany(plans);
      logger.info('🌱 Subscription plans seeded into database successfully');
    }
  } catch (err) {
    logger.warn('Subscription plans seeding skipped:', (err as Error).message);
  }
}

async function seedDemoUser(): Promise<void> {
  // BUG 002: Seed script only runs inside development mode, never in production code
  if (env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const { User } = await import('../models/User');
    const { UserMemory } = await import('../models/UserMemory');

    const demoEmail = 'demo@storyforge.ai';
    const existing = await User.findOne({ email: demoEmail });

    if (!existing) {
      const demoUser = await User.create({
        name: 'Enterprise Creator (Dev)',
        email: demoEmail,
        password: 'StoryForge#2026!',
        credits: 10000,
        creditsTotal: 10000,
        creditsUsed: 0,
        plan: 'enterprise',
        isEmailVerified: true,
      });

      await UserMemory.create({ userId: demoUser._id });
      logger.info('🌱 Enterprise Demo user seeded: demo@storyforge.ai / StoryForge#2026! (10,000 Credits)');
    } else if (existing.plan !== 'enterprise' || existing.credits < 10000) {
      existing.plan = 'enterprise';
      existing.credits = 10000;
      existing.creditsTotal = 10000;
      await existing.save();
      logger.info('⚡ Upgraded existing demo user to Enterprise Development Account (10,000 Credits)');
    }
  } catch (err) {
    logger.warn('Demo user seeding skipped:', (err as Error).message);
  }
}
