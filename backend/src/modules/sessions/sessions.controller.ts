import { Response } from 'express';
import { sessionsService } from './sessions.service';
import { sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';

export const listSessions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const currentTokenId = req.user?.tokenId;
  const sessions = await sessionsService.getUserSessions(req.user!._id.toString(), currentTokenId);
  sendSuccess(res, { sessions });
});

export const revokeSession = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const tokenId = req.params.tokenId as string;
  await sessionsService.revokeSession(req.user!._id.toString(), tokenId);
  sendSuccess(res, null, 'Session revoked');
});

export const revokeAllSessions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const currentTokenId = req.user?.tokenId;
  const count = await sessionsService.revokeAllSessions(req.user!._id.toString(), currentTokenId);
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  sendSuccess(res, { revokedCount: count }, 'All other device sessions revoked');
});
