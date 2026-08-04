import crypto from 'crypto';
import { OrganizationsRepository, organizationsRepository } from './organizations.repository';
import { Invite } from '../../models/Invite';
import { emailService } from '../../services/EmailService';
import { auditRepository } from '../audit/audit.repository';
import { AppError, ErrorCode } from '@storyforge/shared';
import type { CreateOrganizationInput, SendInviteInput, OrgRole, Organization as OrgType } from '@storyforge/shared';

export class OrganizationsService {
  constructor(private readonly orgRepo: OrganizationsRepository = organizationsRepository) {}

  async createOrganization(userId: string, input: CreateOrganizationInput): Promise<OrgType> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await this.orgRepo.findBySlug(slug);
    if (existing) {
      throw AppError.conflict('An organization with this slug already exists', ErrorCode.VALIDATION_ERROR);
    }

    const org = await this.orgRepo.create({
      name: input.name,
      slug,
      ownerId: userId as any,
      members: [{ userId: userId as any, role: 'owner', joinedAt: new Date() }],
    });

    await auditRepository.logEvent({
      userId,
      organizationId: org._id.toString(),
      action: 'org.create',
      metadata: { name: org.name, slug },
    });

    return org.toObject() as unknown as OrgType;
  }

  async getUserOrganizations(userId: string): Promise<OrgType[]> {
    const orgs = await this.orgRepo.findByUserId(userId);
    return orgs.map((o) => o.toObject() as unknown as OrgType);
  }

  async sendInvite(inviterUserId: string, inviterName: string, input: SendInviteInput): Promise<boolean> {
    const org = await this.orgRepo.findById(input.organizationId);
    if (!org) throw AppError.notFound('Organization');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Invite.create({
      organizationId: org._id,
      teamId: input.teamId,
      email: input.email.toLowerCase(),
      role: input.role,
      invitedBy: inviterUserId,
      token,
      expiresAt,
      status: 'pending',
    });

    await emailService.sendOrgInviteEmail(input.email, org.name, inviterName, token);

    await auditRepository.logEvent({
      userId: inviterUserId,
      organizationId: org._id.toString(),
      action: 'org.invite_sent',
      metadata: { recipientEmail: input.email, role: input.role },
    });

    return true;
  }

  async acceptInvite(userId: string, token: string): Promise<boolean> {
    const invite = await Invite.findOne({ token, status: 'pending', expiresAt: { $gt: new Date() } });
    if (!invite) throw AppError.badRequest('Invite is invalid or has expired', ErrorCode.INVALID_TOKEN);

    await this.orgRepo.addMember(invite.organizationId.toString(), userId, invite.role as OrgRole);
    invite.status = 'accepted';
    await invite.save();

    await auditRepository.logEvent({
      userId,
      organizationId: invite.organizationId.toString(),
      action: 'org.invite_accepted',
    });

    return true;
  }
}

export const organizationsService = new OrganizationsService();
