import { Request, Response } from 'express';
import { authService } from './auth.service';
import { emailService } from '../../services/EmailService';
import { User } from '../../models/User';
import { AppError, sendSuccess, asyncHandler, COOKIE_OPTIONS } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyTotpSchema } from '@storyforge/shared';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const { user, tokens } = await authService.register(body.data, reqMeta);

  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Registration successful', 201);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest('Invalid login format');

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const result = await authService.login(body.data, reqMeta);

  if (result.requires2FA) {
    sendSuccess(res, { requires2FA: true, tempToken: result.tempToken }, '2FA verification required', 200);
    return;
  }

  res.cookie('refreshToken', result.tokens!.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { user: result.user, accessToken: result.tokens!.accessToken }, 'Login successful');
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) throw AppError.unauthorized('Refresh token required');

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const tokens = await authService.refreshTokens(rawRefreshToken, reqMeta);

  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
  sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const provider = (req.body.provider || req.query.provider) as any;
  const code = (req.body.code || req.query.code) as string;

  if (!provider || !code) throw AppError.badRequest('Provider and authorization code are required');

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const currentUserId = (req as AuthRequest).user?._id?.toString();

  const result = await authService.handleOAuth(provider, code, reqMeta, currentUserId);

  if (result.tokens) {
    res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);
    sendSuccess(res, { user: result.user, accessToken: result.tokens.accessToken }, `${provider} login successful`);
  } else {
    sendSuccess(res, { user: result.user }, `${provider} account linked successfully`);
  }
});

export const requestMagicLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) throw AppError.badRequest('Email is required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (user && user.isActive) {
    const magicToken = jwt.sign({ userId: user._id.toString(), isMagicLink: true }, env.JWT_SECRET, { expiresIn: '15m' });
    await emailService.sendMagicLinkEmail(user.email, magicToken);
  }

  sendSuccess(res, null, 'If an account exists, a magic login link has been sent to your email.');
});

export const verifyMagicLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) throw AppError.badRequest('Magic token is required');

  let decoded: { userId: string; isMagicLink?: boolean };
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as typeof decoded;
  } catch {
    throw AppError.unauthorized('Magic link is invalid or has expired');
  }

  if (!decoded.isMagicLink) throw AppError.badRequest('Invalid magic token type');

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw AppError.unauthorized('User not found or deactivated');

  const reqMeta = { ip: req.ip || '127.0.0.1', userAgent: req.headers['user-agent'] || 'Unknown' };
  const tokens = await authService.login({ email: user.email, password: '', rememberMe: false }, reqMeta); // issue pair

  sendSuccess(res, { user: tokens.user, accessToken: tokens.tokens?.accessToken }, 'Magic link login successful');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = forgotPasswordSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest('Enter a valid email');

  const user = await User.findOne({ email: body.data.email });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  sendSuccess(res, null, 'If your email is registered, you will receive password reset instructions shortly.');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = resetPasswordSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const user = await User.findOne({
    passwordResetToken: body.data.token,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw AppError.badRequest('Reset token is invalid or has expired');

  user.password = body.data.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendSuccess(res, null, 'Password reset successful. You can now log in with your new password.');
});
