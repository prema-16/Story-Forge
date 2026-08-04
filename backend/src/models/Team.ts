import mongoose, { Document, Schema } from 'mongoose';
import type { TeamRole } from '@storyforge/shared';

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
}

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, maxlength: 200 },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'viewer'],
          default: 'editor',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

TeamSchema.index({ organizationId: 1, name: 1 }, { unique: true });
TeamSchema.index({ 'members.userId': 1 });

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
