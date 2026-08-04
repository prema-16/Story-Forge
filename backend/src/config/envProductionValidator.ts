import { z } from 'zod';
import { logger } from './logger';

export const productionEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.number().default(5000),
  CLIENT_URL: z.string().url(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
});

export function validateProductionEnvironment(envVars: Record<string, unknown>): boolean {
  const parsed = productionEnvSchema.safeParse(envVars);

  if (!parsed.success) {
    logger.error('❌ Production Environment Validation FAILED:');
    logger.error(JSON.stringify(parsed.error.format(), null, 2));
    return false;
  }

  logger.info('✅ Production Environment Variables Validated Successfully');
  return true;
}
