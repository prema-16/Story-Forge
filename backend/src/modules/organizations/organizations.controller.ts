import { Response } from 'express';
import { organizationsService } from './organizations.service';
import { AppError, sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';
import { createOrganizationSchema, sendInviteSchema } from '@storyforge/shared';

export const createOrg = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = createOrganizationSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const org = await organizationsService.createOrganization(req.user!._id.toString(), body.data);
  sendSuccess(res, { organization: org }, 'Organization created successfully', 201);
});

export const getMyOrgs = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const orgs = await organizationsService.getUserOrganizations(req.user!._id.toString());
  sendSuccess(res, { organizations: orgs });
});

export const inviteMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = sendInviteSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  await organizationsService.sendInvite(req.user!._id.toString(), req.user!.name, body.data);
  sendSuccess(res, null, `Invitation sent to ${body.data.email}`);
});

export const acceptInviteToken = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { token } = req.body;
  if (!token) throw AppError.badRequest('Invite token is required');

  await organizationsService.acceptInvite(req.user!._id.toString(), token);
  sendSuccess(res, null, 'Invitation accepted successfully');
});
