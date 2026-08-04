import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AuthRepository, authRepository } from './auth.repository';
import { SessionsRepository, sessionsRepository } from '../sessions/sessions.repository';
import { auditRepository } from '../audit/audit.repository';
import { emailService } from '../../services/EmailService';
import { twoFactorService } from '../../services/TwoFactorService';
import { oauthService } from '../../services/OAuthService';
import { AppError, ErrorCode, MAX_FAILED_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from '@storyforge/shared';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { RegisterInput, LoginInput, OAuthProvider, UserPublic } from '@storyforge/shared';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
}

export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly sessionRepo: SessionsRepository = sessionsRepository
  ) {}

  /**
   * Register a new user account.
   */
  async register(input: RegisterInput, reqMeta: { ip: string; userAgent: string }): Promise<{ user: UserPublic; tokens: TokenPair }> {
    const existing = await this.authRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email address already exists', ErrorCode.EMAIL_EXISTS);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.authRepo.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
      credits: 100,
      creditsUsed: 0,
      creditsTotal: 100,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    emailService.sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      logger.warn('[AuthService] Verification email send error:', err.message);
    });

    // Generate tokens & session
    const tokens = await this.issueTokenPair(user._id.toString(), user.role, reqMeta);

    await auditRepository.logEvent({
      userId: user._id.toString(),
      action: 'user.register',
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  /**
   * Login with email and password (with lockout protection & 2FA challenge check).
   */
  async login(input: LoginInput, reqMeta: { ip: string; userAgent: string }): Promise<{
    user?: UserPublic;
    tokens?: TokenPair;
    requires2FA?: boolean;
    tempToken?: string;
  }> {
    const user = await this.authRepo.findByEmail(input.email, true);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated', ErrorCode.ACCOUNT_DEACTIVATED);
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      await auditRepository.logEvent({
        userId: user._id.toString(),
        action: 'user.login_failed',
        metadata: { reason: 'locked_out' },
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
        success: false,
      });
      throw new AppError(
        `Account locked due to consecutive failed attempts. Try again in ${minutesLeft} minutes.`,
        423,
        ErrorCode.ACCOUNT_DEACTIVATED
      );
    }

    const isValidPassword = await user.comparePassword(input.password);
    if (!isValidPassword) {
      const updatedUser = await this.authRepo.incrementFailedLogins(user._id.toString());
      if (updatedUser && updatedUser.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await this.authRepo.lockAccount(user._id.toString(), lockoutTime);
        await auditRepository.logEvent({
          userId: user._id.toString(),
          action: 'user.account_locked',
          ip: reqMeta.ip,
          userAgent: reqMeta.userAgent,
        });
      }
      throw AppError.unauthorized('Invalid email or password', ErrorCode.INVALID_CREDENTIALS);
    }

    // Reset lockout counter on success
    await this.authRepo.resetLockout(user._id.toString());

    // Check 2FA requirement
    if (user.isTwoFactorEnabled) {
      if (!input.totpCode) {
        const tempToken = jwt.sign(
          { userId: user._id.toString(), is2FAChallenge: true },
          env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return { requires2FA: true, tempToken };
      }

      const isValidTotp = twoFactorService.verifyTotp(input.totpCode, user.twoFactorSecret || '');
      if (!isValidTotp) {
        throw AppError.unauthorized('Invalid 2FA authentication code', ErrorCode.INVALID_TOKEN);
      }
    }

    const tokens = await this.issueTokenPair(user._id.toString(), user.role, reqMeta);

    await auditRepository.logEvent({
      userId: user._id.toString(),
      action: 'user.login',
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  /**
   * Rotate refresh token and issue new token pair.
   */
  async refreshTokens(rawRefreshToken: string, reqMeta: { ip: string; userAgent: string }): Promise<TokenPair> {
    let decoded: { userId: string; role: string; tokenId: string };
    try {
      decoded = jwt.verify(rawRefreshToken, env.JWT_SECRET) as typeof decoded;
    } catch {
      throw AppError.unauthorized('Refresh token expired or invalid', ErrorCode.TOKEN_EXPIRED);
    }

    const session = await this.sessionRepo.findByTokenId(decoded.tokenId);
    if (!session || session.isRevoked) {
      throw AppError.unauthorized('Refresh token has been revoked', ErrorCode.TOKEN_REVOKED);
    }

    const user = await this.authRepo.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or deactivated', ErrorCode.ACCOUNT_DEACTIVATED);
    }

    // Revoke old session (Rotation)
    await this.sessionRepo.revokeSession(decoded.tokenId);

    // Issue new session & tokens
    const tokens = await this.issueTokenPair(user._id.toString(), user.role, reqMeta);
    return tokens;
  }

  /**
   * Complete OAuth authentication or account linking.
   */
  async handleOAuth(provider: OAuthProvider, code: string, reqMeta: { ip: string; userAgent: string }, currentUserId?: string) {
    const profile = await oauthService.exchangeCodeForProfile(provider, code);

    // Account Linking Mode
    if (currentUserId) {
      const user = await this.authRepo.findById(currentUserId);
      if (!user) throw AppError.notFound('User');

      const alreadyLinked = user.oauthAccounts.some((a) => a.provider === provider);
      if (!alreadyLinked) {
        user.oauthAccounts.push({
          provider,
          providerId: profile.providerId,
          email: profile.email,
          linkedAt: new Date(),
        });
        await user.save();
      }
      return { user: this.toPublicUser(user) };
    }

    // Login or Register via OAuth
    let user = await this.authRepo.findByOAuthProvider(provider, profile.providerId);

    if (!user) {
      user = await this.authRepo.findByEmail(profile.email);
      if (user) {
        // Link to existing email
        user.oauthAccounts.push({
          provider,
          providerId: profile.providerId,
          email: profile.email,
          linkedAt: new Date(),
        });
        await user.save();
      } else {
        // Create new account via OAuth
        user = await this.authRepo.create({
          name: profile.name,
          email: profile.email.toLowerCase(),
          avatar: profile.avatar,
          isEmailVerified: true,
          credits: 100,
          creditsUsed: 0,
          creditsTotal: 100,
          oauthAccounts: [{ provider, providerId: profile.providerId, email: profile.email, linkedAt: new Date() }],
        });
      }
    }

    const tokens = await this.issueTokenPair(user._id.toString(), user.role, reqMeta);
    await auditRepository.logEvent({
      userId: user._id.toString(),
      action: 'user.login',
      metadata: { provider },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    return { user: this.toPublicUser(user), tokens };
  }

  /**
   * Issue access + refresh token pair and record session.
   */
  private async issueTokenPair(userId: string, role: string, reqMeta: { ip: string; userAgent: string }): Promise<TokenPair> {
    const tokenId = crypto.randomBytes(16).toString('hex');
    const jti = crypto.randomBytes(16).toString('hex');

    const accessToken = jwt.sign({ userId, role, jti }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign({ userId, role, tokenId, jti: crypto.randomBytes(16).toString('hex') }, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Parse basic user agent info
    const ua = reqMeta.userAgent || '';
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'OS';

    await this.sessionRepo.create({
      userId: userId as any,
      tokenId,
      refreshTokenHash,
      userAgent: ua,
      browser,
      os,
      device: ua.includes('Mobile') ? 'Mobile' : 'Desktop',
      ip: reqMeta.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      lastActiveAt: new Date(),
    });

    return { accessToken, refreshToken, tokenId };
  }

  private toPublicUser(user: any): UserPublic {
    return {
      _id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      plan: user.plan,
      credits: user.credits,
      avatar: user.avatar,
      isTwoFactorEnabled: user.isTwoFactorEnabled ?? false,
    };
  }
}

export const authService = new AuthService();
