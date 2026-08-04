import crypto from 'crypto';
import { UsersRepository, usersRepository } from './users.repository';
import { twoFactorService } from '../../services/TwoFactorService';
import { auditRepository } from '../audit/audit.repository';
import { AppError, ErrorCode, API_KEY_PREFIX } from '@storyforge/shared';
import type { UpdateProfileInput, TwoFactorSetupResponse, ApiKeyItem, UserPublic } from '@storyforge/shared';

export class UsersService {
  constructor(private readonly usersRepo: UsersRepository = usersRepository) {}

  async getUserById(userId: string): Promise<UserPublic> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw AppError.notFound('User');
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput, reqMeta?: { ip: string; userAgent: string }): Promise<UserPublic> {
    if (input.username) {
      const existing = await this.usersRepo.findByUsername(input.username);
      if (existing && existing._id.toString() !== userId) {
        throw AppError.conflict('Username is already taken', ErrorCode.VALIDATION_ERROR);
      }
    }

    const updated = await this.usersRepo.updateProfile(userId, input);
    if (!updated) throw AppError.notFound('User');

    if (reqMeta) {
      await auditRepository.logEvent({
        userId,
        action: 'user.profile_update',
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
      });
    }

    return this.toPublicUser(updated);
  }

  // ─── 2FA Management ─────────────────────────────────────────────────────────

  async setup2FA(userId: string): Promise<TwoFactorSetupResponse> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw AppError.notFound('User');

    const setup = twoFactorService.generateSecret(user.email);
    user.twoFactorSecret = setup.secret;
    await user.save();

    return {
      secret: setup.secret,
      qrCodeUrl: setup.otpauthUrl,
      recoveryCodes: setup.recoveryCodes,
    };
  }

  async enable2FA(userId: string, code: string, recoveryCodes: string[]): Promise<boolean> {
    const user = await this.usersRepo.findById(userId);
    if (!user || !user.twoFactorSecret) throw AppError.badRequest('2FA setup not initialized');

    const isValid = twoFactorService.verifyTotp(code, user.twoFactorSecret);
    if (!isValid) throw AppError.badRequest('Invalid 2FA verification code', ErrorCode.INVALID_TOKEN);

    const hashedCodes = await twoFactorService.hashRecoveryCodes(recoveryCodes);
    user.isTwoFactorEnabled = true;
    user.twoFactorRecoveryCodes = hashedCodes;
    await user.save();

    await auditRepository.logEvent({ userId, action: 'user.2fa_enabled' });
    return true;
  }

  async disable2FA(userId: string, code: string): Promise<boolean> {
    const user = await this.usersRepo.findById(userId);
    if (!user || !user.isTwoFactorEnabled) throw AppError.badRequest('2FA is not enabled');

    const isValid = twoFactorService.verifyTotp(code, user.twoFactorSecret || '');
    if (!isValid) throw AppError.badRequest('Invalid 2FA verification code', ErrorCode.INVALID_TOKEN);

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorRecoveryCodes = undefined;
    await user.save();

    await auditRepository.logEvent({ userId, action: 'user.2fa_disabled' });
    return true;
  }

  // ─── API Key Management ──────────────────────────────────────────────────────

  async createApiKey(userId: string, name: string, expiresInDays?: number): Promise<{ apiKey: string; item: ApiKeyItem }> {
    const rawKey = `${API_KEY_PREFIX}${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawKey.slice(0, 12);
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : undefined;

    const user = await this.usersRepo.addApiKey(userId, name, keyPrefix, hashedKey, expiresAt);
    if (!user) throw AppError.notFound('User');

    const createdKey = user.apiKeys[user.apiKeys.length - 1];

    await auditRepository.logEvent({
      userId,
      action: 'user.apikey_created',
      metadata: { keyName: name, keyPrefix },
    });

    return {
      apiKey: rawKey,
      item: {
        id: (createdKey as any)._id.toString(),
        name: createdKey.name,
        keyPrefix: createdKey.keyPrefix,
        createdAt: createdKey.createdAt.toISOString(),
        expiresAt: createdKey.expiresAt ? createdKey.expiresAt.toISOString() : undefined,
      },
    };
  }

  async revokeApiKey(userId: string, keyId: string): Promise<boolean> {
    const updated = await this.usersRepo.removeApiKey(userId, keyId);
    if (!updated) throw AppError.notFound('User');

    await auditRepository.logEvent({
      userId,
      action: 'user.apikey_revoked',
      metadata: { keyId },
    });

    return true;
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

export const usersService = new UsersService();
