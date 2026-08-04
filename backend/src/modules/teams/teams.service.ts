import { TeamsRepository, teamsRepository } from './teams.repository';
import { auditRepository } from '../audit/audit.repository';
import { AppError } from '@storyforge/shared';
import type { CreateTeamInput, TeamRole, Team as TeamType } from '@storyforge/shared';

export class TeamsService {
  constructor(private readonly teamsRepo: TeamsRepository = teamsRepository) {}

  async createTeam(userId: string, input: CreateTeamInput): Promise<TeamType> {
    const team = await this.teamsRepo.create({
      organizationId: input.organizationId as any,
      name: input.name,
      description: input.description,
      members: [{ userId: userId as any, role: 'owner', joinedAt: new Date() }],
    });

    await auditRepository.logEvent({
      userId,
      organizationId: input.organizationId,
      action: 'team.create',
      metadata: { teamId: team._id.toString(), teamName: team.name },
    });

    return team.toObject() as unknown as TeamType;
  }

  async getOrganizationTeams(organizationId: string): Promise<TeamType[]> {
    const teams = await this.teamsRepo.findByOrganization(organizationId);
    return teams.map((t) => t.toObject() as unknown as TeamType);
  }

  async addTeamMember(teamId: string, userId: string, role: TeamRole = 'editor'): Promise<TeamType> {
    const team = await this.teamsRepo.addMember(teamId, userId, role);
    if (!team) throw AppError.notFound('Team');

    await auditRepository.logEvent({
      userId,
      organizationId: team.organizationId.toString(),
      action: 'team.member_added',
      metadata: { teamId, memberUserId: userId, role },
    });

    return team.toObject() as unknown as TeamType;
  }
}

export const teamsService = new TeamsService();
