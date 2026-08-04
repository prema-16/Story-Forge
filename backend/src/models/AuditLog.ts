import mongoose, { Document, Schema } from 'mongoose';
import type { AuditEventType } from '@storyforge/shared';

export type AuditAction = AuditEventType | string;

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  action: AuditEventType | string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String },
    resourceId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String, required: true, default: '127.0.0.1' },
    userAgent: { type: String, required: true, default: 'Unknown' },
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
