import { Response } from 'express';
import { teamsService } from './teams.service';
import { AppError, sendSuccess, asyncHandler } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/authMiddleware';
import { createTeamSchema } from '@storyforge/shared';

export const createTeam = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const body = createTeamSchema.safeParse(req.body);
  if (!body.success) throw AppError.badRequest(body.error.errors[0].message);

  const team = await teamsService.createTeam(req.user!._id.toString(), body.data);
  sendSuccess(res, { team }, 'Team workspace created successfully', 201);
});

export const getOrgTeams = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const orgId = req.params.orgId as string;
  const teams = await teamsService.getOrganizationTeams(orgId);
  sendSuccess(res, { teams });
});

export const addTeamMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const teamId = req.params.teamId as string;
  const { userId, role } = req.body;
  if (!userId) throw AppError.badRequest('Member userId is required');

  const team = await teamsService.addTeamMember(teamId, userId, role || 'editor');
  sendSuccess(res, { team }, 'Member added to team workspace');
});
