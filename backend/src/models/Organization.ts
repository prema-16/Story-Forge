import mongoose, { Document, Schema } from 'mongoose';
import type { OrgRole, Permission } from '@storyforge/shared';

export interface IOrgMember {
  userId: mongoose.Types.ObjectId;
  role: OrgRole;
  joinedAt: Date;
}

export interface ICustomRole {
  name: string;
  permissions: Permission[];
}

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo?: string;
  ownerId: mongoose.Types.ObjectId;
  members: IOrgMember[];
  customRoles: ICustomRole[];
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    logo: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'guest'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    customRoles: [
      {
        name: { type: String, required: true },
        permissions: [{ type: String, required: true }],
      },
    ],
  },
  { timestamps: true }
);

OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ ownerId: 1 });
OrganizationSchema.index({ 'members.userId': 1 });

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
