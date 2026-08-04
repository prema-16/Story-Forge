import { BaseRepository } from '../../repositories/base.repository';
import { User, IUser } from '../../models/User';
import type { UpdateProfileInput } from '@storyforge/shared';

export class UsersRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.model.findOne({ username: username.toLowerCase() }).exec();
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<IUser | null> {
    const updateQuery: Record<string, unknown> = {};

    if (data.name !== undefined) updateQuery.name = data.name;
    if (data.username !== undefined) updateQuery.username = data.username.toLowerCase();
    if (data.bio !== undefined) updateQuery.bio = data.bio;
    if (data.avatar !== undefined) updateQuery.avatar = data.avatar;

    if (data.preferences) {
      if (data.preferences.theme) updateQuery['preferences.theme'] = data.preferences.theme;
      if (data.preferences.language) updateQuery['preferences.language'] = data.preferences.language;
      if (data.preferences.timezone) updateQuery['preferences.timezone'] = data.preferences.timezone;
      if (data.preferences.emailNotifications) {
        Object.entries(data.preferences.emailNotifications).forEach(([k, v]) => {
          if (v !== undefined) updateQuery[`preferences.emailNotifications.${k}`] = v;
        });
      }
    }

    return this.model.findByIdAndUpdate(userId, { $set: updateQuery }, { new: true, runValidators: true }).exec();
  }

  async addApiKey(userId: string, name: string, keyPrefix: string, hashedKey: string, expiresAt?: Date): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      {
        $push: {
          apiKeys: {
            name,
            keyPrefix,
            hashedKey,
            createdAt: new Date(),
            expiresAt,
          },
        },
      },
      { new: true }
    ).exec();
  }

  async removeApiKey(userId: string, keyId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $pull: { apiKeys: { _id: keyId } } },
      { new: true }
    ).exec();
  }

  async updateApiKeyLastUsed(userId: string, keyId: string): Promise<void> {
    await this.model.updateOne(
      { _id: userId, 'apiKeys._id': keyId },
      { $set: { 'apiKeys.$.lastUsedAt': new Date() } }
    ).exec();
  }
}

export const usersRepository = new UsersRepository();
