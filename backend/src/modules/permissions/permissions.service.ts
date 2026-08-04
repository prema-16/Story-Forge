import type { Permission, OrgRole, TeamRole, UserRole } from '@storyforge/shared';
import { DEFAULT_ORG_ROLE_PERMISSIONS, DEFAULT_TEAM_ROLE_PERMISSIONS } from '@storyforge/shared';

export class PermissionsService {
  /**
   * Check if a user role has a global platform permission.
   */
  hasPlatformPermission(role: UserRole, permission: Permission): boolean {
    if (role === 'superadmin') return true;
    if (role === 'admin') {
      return permission !== 'org:manage'; // admin has almost all
    }
    return false;
  }

  /**
   * Check if an org role has a permission.
   */
  hasOrgPermission(role: OrgRole, permission: Permission, customPermissions?: Permission[]): boolean {
    if (customPermissions && customPermissions.includes(permission)) return true;
    const allowed = DEFAULT_ORG_ROLE_PERMISSIONS[role] || [];
    return allowed.includes(permission);
  }

  /**
   * Check if a team role has a permission.
   */
  hasTeamPermission(role: TeamRole, permission: Permission): boolean {
    const allowed = DEFAULT_TEAM_ROLE_PERMISSIONS[role] || [];
    return allowed.includes(permission);
  }

  /**
   * Combine all permissions for a user in an organization context.
   */
  getEffectivePermissions(userRole: UserRole, orgRole?: OrgRole, teamRole?: TeamRole): Permission[] {
    const permSet = new Set<Permission>();

    if (userRole === 'superadmin') {
      return [
        'project:create',
        'project:read',
        'project:update',
        'project:delete',
        'ai:generate',
        'billing:manage',
        'org:invite',
        'org:manage',
        'team:create',
        'team:manage',
        'video:publish',
        'analytics:view',
        'admin:dashboard',
        'audit:read',
      ];
    }

    if (orgRole) {
      (DEFAULT_ORG_ROLE_PERMISSIONS[orgRole] || []).forEach((p) => permSet.add(p));
    }

    if (teamRole) {
      (DEFAULT_TEAM_ROLE_PERMISSIONS[teamRole] || []).forEach((p) => permSet.add(p));
    }

    if (permSet.size === 0) {
      // Default basic member permissions
      permSet.add('project:create');
      permSet.add('project:read');
      permSet.add('project:update');
      permSet.add('ai:generate');
    }

    return Array.from(permSet);
  }
}

export const permissionsService = new PermissionsService();
