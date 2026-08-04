import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { permissionsService } from '../../modules/permissions/permissions.service';
import { Organization } from '../../models/Organization';
import { Team } from '../../models/Team';
import { AppError, ErrorCode, Permission, OrgRole, TeamRole } from '@storyforge/shared';

/**
 * Require specific granular permission(s).
 */
export function requirePermission(...permissions: Permission[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    // Superadmin bypasses permission checks
    if (req.user.role === 'superadmin') {
      return next();
    }

    const orgId = (req.params.orgId || req.body.organizationId || req.query.organizationId) as string;
    let orgRole: OrgRole | undefined;

    if (orgId) {
      const org = await Organization.findById(orgId);
      if (org) {
        const member = org.members.find((m) => m.userId.toString() === req.user!._id.toString());
        if (member) orgRole = member.role as OrgRole;
      }
    }

    const effectivePermissions = permissionsService.getEffectivePermissions(req.user.role, orgRole);

    const hasAll = permissions.every((p) => effectivePermissions.includes(p));
    if (!hasAll) {
      return next(AppError.forbidden(`Missing required permission: ${permissions.join(', ')}`, ErrorCode.FORBIDDEN));
    }

    next();
  };
}

/**
 * Require organization role.
 */
export function requireOrgRole(...roles: OrgRole[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next(AppError.unauthorized('Authentication required'));
    if (req.user.role === 'superadmin') return next();

    const orgId = (req.params.orgId || req.body.organizationId || req.query.organizationId) as string;
    if (!orgId) return next(AppError.badRequest('Organization ID required'));

    const org = await Organization.findById(orgId);
    if (!org) return next(AppError.notFound('Organization'));

    const member = org.members.find((m) => m.userId.toString() === req.user!._id.toString());
    if (!member || !roles.includes(member.role as OrgRole)) {
      return next(AppError.forbidden(`Requires Organization role: ${roles.join(' or ')}`, ErrorCode.FORBIDDEN));
    }

    next();
  };
}

/**
 * Require team workspace role.
 */
export function requireTeamRole(...roles: TeamRole[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next(AppError.unauthorized('Authentication required'));
    if (req.user.role === 'superadmin') return next();

    const teamId = (req.params.teamId || req.body.teamId || req.query.teamId) as string;
    if (!teamId) return next(AppError.badRequest('Team ID required'));

    const team = await Team.findById(teamId);
    if (!team) return next(AppError.notFound('Team'));

    const member = team.members.find((m) => m.userId.toString() === req.user!._id.toString());
    if (!member || !roles.includes(member.role as TeamRole)) {
      return next(AppError.forbidden(`Requires Team role: ${roles.join(' or ')}`, ErrorCode.FORBIDDEN));
    }

    next();
  };
}
