import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User';
import { UserMemory } from '../models/UserMemory';
import { env } from '../config/env';
import { AppError, sendSuccess, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { tokenService } from '../services/TokenService';
import { createAuditLog } from '../middleware/auditLogger';
import { logger } from '../config/logger';

// ========================
// Validation schemas
// ========================
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ========================
// Token helpers
// ========================
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

function generateTokens(userId: string, role: string, tokenId: string) {
  const jti = crypto.randomBytes(16).toString('hex');

  const accessToken = jwt.sign(
    { userId, role, jti },
    env.JWT_SECRET as string,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );

  const refreshToken = jwt.sign(
    { userId, role, tokenId, jti: crypto.randomBytes(16).toString('hex') },
    env.JWT_SECRET as string,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
  );

  return { accessToken, refreshToken };
}

// ========================
// Controllers
// ========================

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');

  const { name, email, password } = body.data;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');

  const user = await User.create({ name, email, password, credits: 100 });
  await UserMemory.create({ userId: user._id });

  const tokenId = tokenService.generateTokenId();
  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role, tokenId);

  // Store hashed refresh token in Redis
  await tokenService.storeRefreshToken(
    user._id.toString(),
    refreshToken,
    req.headers['user-agent'] || '',
    (Array.isArray(req.ip) ? req.ip[0] : req.ip) || ''
  );

  await createAuditLog(req, 'user.register', { resourceId: user._id.toString() });
  logger.info(`[Auth] New user registered: ${email}`);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  sendSuccess(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        plan: user.plan,
      },
      accessToken,
    },
    'Registration successful',
    201
  );
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) throw new AppError('Invalid email or password format', 400);

  const { email, password } = body.data;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 403);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokenId = tokenService.generateTokenId();
  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role, tokenId);

  await tokenService.storeRefreshToken(
    user._id.toString(),
    refreshToken,
    req.headers['user-agent'] || '',
    (Array.isArray(req.ip) ? req.ip[0] : req.ip) || ''
  );

  await createAuditLog(req, 'user.login', { resourceId: user._id.toString() });

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      plan: user.plan,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
  }, 'Login successful');
});

/**
 * POST /api/auth/refresh — token rotation
 */
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) throw new AppError('Refresh token required', 401);

  let decoded: { userId: string; role: string; tokenId: string };
  try {
    decoded = jwt.verify(rawRefreshToken, env.JWT_SECRET) as typeof decoded;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'TOKEN_EXPIRED');
  }

  if (!decoded.tokenId) throw new AppError('Malformed refresh token', 401);

  // Validate against stored hash
  const isValid = await tokenService.validateRefreshToken(
    decoded.userId,
    decoded.tokenId,
    rawRefreshToken
  );
  if (!isValid) throw new AppError('Refresh token has been revoked', 401, 'TOKEN_REVOKED');

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new AppError('User not found or deactivated', 401);

  // Revoke old token (rotation)
  await tokenService.revokeRefreshToken(decoded.userId, decoded.tokenId);

  // Issue new token pair
  const newTokenId = tokenService.generateTokenId();
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    decoded.userId,
    decoded.role,
    newTokenId
  );

  await tokenService.storeRefreshToken(
    decoded.userId,
    newRefreshToken,
    req.headers['user-agent'] || '',
    req.ip || ''
  );

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { accessToken }, 'Token refreshed');
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (rawRefreshToken) {
    try {
      const decoded = jwt.decode(rawRefreshToken) as { userId?: string; tokenId?: string };
      if (decoded?.userId && decoded?.tokenId) {
        await tokenService.revokeRefreshToken(decoded.userId, decoded.tokenId);
      }
    } catch {
      // Token decode failure — still clear the cookie
    }
  }

  await createAuditLog(req, 'user.logout');
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  sendSuccess(res, null, 'Logged out successfully');
});

/**
 * POST /api/auth/logout-all — revoke all sessions
 */
export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await tokenService.revokeAllTokens(req.user!._id.toString());
  await createAuditLog(req, 'user.logout_all', { resourceId: req.user!._id.toString() });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  sendSuccess(res, null, 'All sessions revoked');
});

/**
 * GET /api/auth/sessions — list active sessions
 */
export const getSessions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await tokenService.listSessions(req.user!._id.toString());
  sendSuccess(res, { sessions });
});

/**
 * DELETE /api/auth/sessions/:tokenId — revoke specific session
 */
export const revokeSession = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const tokenId = req.params.tokenId as string;
  await tokenService.revokeRefreshToken(req.user!._id.toString(), tokenId);
  sendSuccess(res, null, 'Session revoked');
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { user });
});
