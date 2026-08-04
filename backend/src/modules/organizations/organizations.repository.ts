import { BaseRepository } from '../../repositories/base.repository';
import { Organization, IOrganization } from '../../models/Organization';
import type { OrgRole, Permission } from '@storyforge/shared';

export class OrganizationsRepository extends BaseRepository<IOrganization> {
  constructor() {
    super(Organization);
  }

  async findBySlug(slug: string): Promise<IOrganization | null> {
    return this.model.findOne({ slug: slug.toLowerCase() }).exec();
  }

  async findByUserId(userId: string): Promise<IOrganization[]> {
    return this.model.find({ 'members.userId': userId }).exec();
  }

  async addMember(orgId: string, userId: string, role: OrgRole = 'member'): Promise<IOrganization | null> {
    return this.model.findByIdAndUpdate(
      orgId,
      { $addToSet: { members: { userId, role, joinedAt: new Date() } } },
      { new: true }
    ).exec();
  }

  async removeMember(orgId: string, userId: string): Promise<IOrganization | null> {
    return this.model.findByIdAndUpdate(
      orgId,
      { $pull: { members: { userId } } },
      { new: true }
    ).exec();
  }

  async updateMemberRole(orgId: string, userId: string, role: OrgRole): Promise<IOrganization | null> {
    return this.model.findOneAndUpdate(
      { _id: orgId, 'members.userId': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    ).exec();
  }

  async addCustomRole(orgId: string, name: string, permissions: Permission[]): Promise<IOrganization | null> {
    return this.model.findByIdAndUpdate(
      orgId,
      { $push: { customRoles: { name, permissions } } },
      { new: true }
    ).exec();
  }
}

export const organizationsRepository = new OrganizationsRepository();
