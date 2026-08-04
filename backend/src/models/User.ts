import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole, UserPlan, OAuthProvider, UserPreferences } from '@storyforge/shared';

export interface IOAuthAccount {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  linkedAt: Date;
}

export interface IApiKey {
  _id: mongoose.Types.ObjectId;
  name: string;
  keyPrefix: string;
  hashedKey: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username?: string;
  email: string;
  password?: string;
  bio?: string;
  role: UserRole;
  plan: UserPlan;
  credits: number;
  creditsUsed: number;
  creditsTotal?: number;
  tokenId?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // 2FA
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorRecoveryCodes?: string[];
  trustedDevices?: string[]; // hashed trusted device cookies

  // OAuth
  oauthAccounts: IOAuthAccount[];

  // API Keys
  apiKeys: IApiKey[];

  // User Preferences
  preferences: UserPreferences;

  // Security / Lockout
  failedLoginAttempts: number;
  lockoutUntil?: Date;

  lastLoginAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_-]+$/, 'Invalid username format'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: { type: String, minlength: 8, select: false },
    bio: { type: String, maxlength: 500 },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
    credits: { type: Number, default: 100, min: 0 },
    creditsUsed: { type: Number, default: 0 },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // 2FA
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorRecoveryCodes: [{ type: String, select: false }],
    trustedDevices: [{ type: String, select: false }],

    // OAuth
    oauthAccounts: [
      {
        provider: { type: String, enum: ['google', 'github', 'microsoft', 'discord'], required: true },
        providerId: { type: String, required: true },
        email: { type: String, required: true },
        linkedAt: { type: Date, default: Date.now },
      },
    ],

    // API Keys
    apiKeys: [
      {
        name: { type: String, required: true },
        keyPrefix: { type: String, required: true },
        hashedKey: { type: String, required: true, select: false },
        createdAt: { type: Date, default: Date.now },
        lastUsedAt: { type: Date },
        expiresAt: { type: Date },
      },
    ],

    // Preferences
    preferences: {
      theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      emailNotifications: {
        generationComplete: { type: Boolean, default: true },
        renderComplete: { type: Boolean, default: true },
        creditsLow: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
      },
    },

    // Security / Lockout
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },

    lastLoginAt: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as Record<string, unknown>).password;
        delete (ret as Record<string, unknown>).twoFactorSecret;
        delete (ret as Record<string, unknown>).twoFactorRecoveryCodes;
        delete (ret as Record<string, unknown>).trustedDevices;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ 'oauthAccounts.provider': 1, 'oauthAccounts.providerId': 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
