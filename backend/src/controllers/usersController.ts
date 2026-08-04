import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError, sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { createAuditLog } from '../middleware/auditLogger';
import { logger } from '../config/logger';

// ─── Validation ───────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * PATCH /api/users/profile
 * Update the authenticated user's profile (name, avatar).
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = updateProfileSchema.safeParse(req.body);
  if (!body.success) {
    throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');
  }

  const updates: { name?: string; avatar?: string } = {};
  if (body.data.name !== undefined) updates.name = body.data.name;
  if (body.data.avatar !== undefined) updates.avatar = body.data.avatar;

  if (Object.keys(updates).length === 0) {
    throw new AppError('No update fields provided', 400, 'VALIDATION_ERROR');
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  await createAuditLog(req, 'user.profile_update', {
    resourceId: user._id.toString(),
    metadata: { updatedFields: Object.keys(updates) },
  });

  logger.info(`[Users] Profile updated: ${user.email}`);

  sendSuccess(res, { user }, 'Profile updated successfully');
});

/**
 * GET /api/users/me/credits
 * Return the authenticated user's current credit balance.
 */
export const getCredits = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id).select('credits creditsUsed plan');
  if (!user) throw new AppError('User not found', 404);

  sendSuccess(res, {
    credits: user.credits,
    creditsUsed: user.creditsUsed,
    plan: user.plan,
  });
});
