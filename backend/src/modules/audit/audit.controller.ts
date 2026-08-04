import { Response } from 'express';
import { auditService } from './audit.service';
import { sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';

export const getUserLogs = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const logs = await auditService.getUserAuditLogs(req.user!._id.toString(), limit);
  sendSuccess(res, { logs });
});

export const getOrgLogs = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const orgId = req.params.orgId as string;
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const logs = await auditService.getOrgAuditLogs(orgId, limit);
  sendSuccess(res, { logs });
});
