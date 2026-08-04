import { Response } from 'express';
import { User } from '../../models/User';
import { AuditLog } from '../../models/AuditLog';
import { AppError, sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';
import { auditRepository } from '../audit/audit.repository';

export const listUsers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search ? String(req.query.search) : '';

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-password -twoFactorSecret');

  sendSuccess(res, { users }, 'Users list fetched', 200, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') throw AppError.badRequest('isActive boolean is required');

  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!user) throw AppError.notFound('User');

  await auditRepository.logEvent({
    userId: req.user!._id.toString(),
    action: isActive ? 'admin.user_activated' : 'admin.user_deactivated',
    resourceId: String(userId),
  });

  sendSuccess(res, { user }, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    throw AppError.badRequest('Invalid role type');
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) throw AppError.notFound('User');

  await auditRepository.logEvent({
    userId: req.user!._id.toString(),
    action: 'role.change',
    resourceId: String(userId),
    metadata: { newRole: role },
  });

  sendSuccess(res, { user }, 'User role updated');
});

export const getSystemAuditLogs = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const limit = Number(req.query.limit) || 100;
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).populate('userId', 'name email role');
  sendSuccess(res, { logs });
});
