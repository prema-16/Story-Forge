import { PermissionsService } from '../permissions.service';

describe('PermissionsService — RBAC Tests', () => {
  const service = new PermissionsService();

  it('should grant superadmin full platform access', () => {
    expect(service.hasPlatformPermission('superadmin', 'admin:dashboard')).toBe(true);
    expect(service.hasPlatformPermission('superadmin', 'org:manage')).toBe(true);
  });

  it('should allow org owners to manage organizations', () => {
    expect(service.hasOrgPermission('owner', 'org:manage')).toBe(true);
    expect(service.hasOrgPermission('owner', 'billing:manage')).toBe(true);
  });

  it('should deny org members from performing org manage or billing actions', () => {
    expect(service.hasOrgPermission('member', 'org:manage')).toBe(false);
    expect(service.hasOrgPermission('member', 'billing:manage')).toBe(false);
  });

  it('should allow team editors to generate AI and publish videos', () => {
    expect(service.hasTeamPermission('editor', 'ai:generate')).toBe(true);
    expect(service.hasTeamPermission('editor', 'video:publish')).toBe(true);
  });

  it('should deny team viewers from generating AI content', () => {
    expect(service.hasTeamPermission('viewer', 'ai:generate')).toBe(false);
  });
});
