import { Response } from 'express';
import { usersService } from './users.service';
import { AppError, sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';
import { updateProfileSchema, verifyTotpSchema, createApiKeySchema } from '@storyforge/shared';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await usersService.getUserById(req.user!._id.toString());
  sendSuccess(res, { user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = updateProfileSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const user = await usersService.updateProfile(req.user!._id.toString(), body.data, reqMeta);
  sendSuccess(res, { user }, 'Profile updated successfully');
});

// ─── 2FA Controllers ─────────────────────────────────────────────────────────

export const setup2FA = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const setupData = await usersService.setup2FA(req.user!._id.toString());
  sendSuccess(res, setupData, '2FA setup initialized');
});

export const enable2FA = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { code, recoveryCodes } = req.body;
  if (!code || !recoveryCodes) throw AppError.badRequest('Code and recoveryCodes are required');

  await usersService.enable2FA(req.user!._id.toString(), code, recoveryCodes);
  sendSuccess(res, null, 'Two-factor authentication enabled successfully');
});

export const disable2FA = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = verifyTotpSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest('6-digit code required');

  await usersService.disable2FA(req.user!._id.toString(), body.data.code);
  sendSuccess(res, null, 'Two-factor authentication disabled successfully');
});

// ─── API Keys Controllers ────────────────────────────────────────────────────

export const createApiKey = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = createApiKeySchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const keyData = await usersService.createApiKey(req.user!._id.toString(), body.data.name, body.data.expiresInDays);
  sendSuccess(res, keyData, 'API key generated successfully', 201);
});

export const revokeApiKey = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const keyId = req.params.keyId as string;
  await usersService.revokeApiKey(req.user!._id.toString(), keyId);
  sendSuccess(res, null, 'API key revoked');
});
