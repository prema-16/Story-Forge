import { BaseRepository } from '../../repositories/base.repository';
import { User, IUser } from '../../models/User';
import type { OAuthProvider } from '@storyforge/shared';

export class AuthRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+password');
    return query.exec();
  }

  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return this.model.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).exec();
  }

  async findByPasswordResetToken(token: string): Promise<IUser | null> {
    return this.model.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).exec();
  }

  async findByOAuthProvider(provider: OAuthProvider, providerId: string): Promise<IUser | null> {
    return this.model.findOne({
      'oauthAccounts.provider': provider,
      'oauthAccounts.providerId': providerId,
    }).exec();
  }

  async incrementFailedLogins(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $inc: { failedLoginAttempts: 1 } },
      { new: true }
    ).exec();
  }

  async lockAccount(userId: string, until: Date): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { lockoutUntil: until, failedLoginAttempts: 0 },
      { new: true }
    ).exec();
  }

  async resetLockout(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $unset: { lockoutUntil: 1 }, failedLoginAttempts: 0, lastLoginAt: new Date() },
      { new: true }
    ).exec();
  }
}

export const authRepository = new AuthRepository();
