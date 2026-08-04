import { BaseRepository } from '../../repositories/base.repository';
import { Team, ITeam } from '../../models/Team';
import type { TeamRole } from '@storyforge/shared';

export class TeamsRepository extends BaseRepository<ITeam> {
  constructor() {
    super(Team);
  }

  async findByOrganization(organizationId: string): Promise<ITeam[]> {
    return this.model.find({ organizationId }).exec();
  }

  async findByUserId(userId: string): Promise<ITeam[]> {
    return this.model.find({ 'members.userId': userId }).exec();
  }

  async addMember(teamId: string, userId: string, role: TeamRole = 'editor'): Promise<ITeam | null> {
    return this.model.findByIdAndUpdate(
      teamId,
      { $addToSet: { members: { userId, role, joinedAt: new Date() } } },
      { new: true }
    ).exec();
  }

  async removeMember(teamId: string, userId: string): Promise<ITeam | null> {
    return this.model.findByIdAndUpdate(
      teamId,
      { $pull: { members: { userId } } },
      { new: true }
    ).exec();
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<ITeam | null> {
    return this.model.findOneAndUpdate(
      { _id: teamId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    ).exec();
  }
}

export const teamsRepository = new TeamsRepository();
