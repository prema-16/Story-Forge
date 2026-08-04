import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // AI Providers — Text
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEFAULT_TEXT_PROVIDER: z.enum(['groq', 'openai', 'anthropic', 'deepseek', 'gemini', 'mock']).default('mock'),

  DEFAULT_TEXT_MODEL: z.string().default('gpt-4o'),

  // AI Providers — Image
  STABILITY_AI_API_KEY: z.string().optional(),
  IDEOGRAM_API_KEY: z.string().optional(),
  DEFAULT_IMAGE_PROVIDER: z.enum(['dalle', 'stability', 'ideogram', 'mock']).default('mock'),

  // AI Providers — Video
  RUNWAY_API_KEY: z.string().optional(),
  KLING_API_KEY: z.string().optional(),
  PIKA_API_KEY: z.string().optional(),
  LUMA_API_KEY: z.string().optional(),
  DEFAULT_VIDEO_PROVIDER: z.enum(['runway', 'kling', 'pika', 'luma', 'mock']).default('mock'),

  // AI Providers — Voice
  ELEVENLABS_API_KEY: z.string().optional(),
  GOOGLE_TTS_API_KEY: z.string().optional(),
  DEFAULT_VOICE_PROVIDER: z.enum(['elevenlabs', 'openai-tts', 'google-tts', 'mock']).default('mock'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Stripe Billing
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
  ENABLE_BILLING: z.string().default('false').transform((v) => v === 'true'),

  // YouTube
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_REDIRECT_URI: z.string().optional(),

  // Feature Flags
  ENABLE_MOCK_AI: z.string().default('true').transform((v) => v === 'true'),
  ENABLE_PLUGIN_SYSTEM: z.string().default('true').transform((v) => v === 'true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
