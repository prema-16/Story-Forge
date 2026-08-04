import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenId: string;
  refreshTokenHash: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  location?: {
    city?: string;
    country?: string;
  };
  isRevoked: boolean;
  expiresAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenId: { type: String, required: true, unique: true },
    refreshTokenHash: { type: String, required: true, select: false },
    userAgent: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown Browser' },
    os: { type: String, default: 'Unknown OS' },
    device: { type: String, default: 'Desktop' },
    ip: { type: String, default: '127.0.0.1' },
    location: {
      city: { type: String },
      country: { type: String },
    },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SessionSchema.index({ tokenId: 1 }, { unique: true });
SessionSchema.index({ userId: 1, isRevoked: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-TTL purge

export const Session = mongoose.model<ISession>('Session', SessionSchema);
