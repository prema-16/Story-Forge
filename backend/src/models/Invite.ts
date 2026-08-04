import mongoose, { Document, Schema } from 'mongoose';
import type { OrgRole, TeamRole } from '@storyforge/shared';

export interface IInvite extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  email: string;
  role: OrgRole | TeamRole;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true, default: 'member' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

InviteSchema.index({ token: 1 }, { unique: true });
InviteSchema.index({ organizationId: 1, email: 1 });
InviteSchema.index({ expiresAt: 1 });

export const Invite = mongoose.model<IInvite>('Invite', InviteSchema);
