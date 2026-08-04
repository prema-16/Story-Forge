import { logger } from '../config/logger';

export interface EnterpriseDepartment {
  id: string;
  name: string;
  headId: string;
  workspaces: string[];
}

export interface EnterpriseWorkspace {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  quotaStorageGb: number;
  quotaRendersPerMonth: number;
  rendersUsedThisMonth?: number;
  membersCount: number;
}

export class EnterpriseWorkspaceManager {
  private departments = new Map<string, EnterpriseDepartment>();
  private workspaces = new Map<string, EnterpriseWorkspace>();

  constructor() {
    this.createDepartment({
      id: 'dept_marketing',
      name: 'Global Marketing & Creative Ops',
      headId: 'user_head_1',
      workspaces: ['ws_social_reels', 'ws_brand_campaigns'],
    });

    this.createWorkspace({
      id: 'ws_social_reels',
      organizationId: 'org_enterprise_1',
      departmentId: 'dept_marketing',
      name: 'Social Shortform Video Workspace',
      quotaStorageGb: 5000,
      quotaRendersPerMonth: 2000,
      rendersUsedThisMonth: 342,
      membersCount: 18,
    });
  }

  createDepartment(dept: EnterpriseDepartment): void {
    this.departments.set(dept.id, dept);
    logger.info(`[EnterpriseWorkspaceManager] Registered Department '${dept.name}'`);
  }

  createWorkspace(ws: EnterpriseWorkspace): void {
    this.workspaces.set(ws.id, {
      ...ws,
      rendersUsedThisMonth: ws.rendersUsedThisMonth || 0,
    });
    logger.info(`[EnterpriseWorkspaceManager] Registered Workspace '${ws.name}'`);
  }

  getWorkspaces(): EnterpriseWorkspace[] {
    return Array.from(this.workspaces.values());
  }

  getWorkspaceById(id: string): EnterpriseWorkspace | undefined {
    return this.workspaces.get(id);
  }

  getDepartments(): EnterpriseDepartment[] {
    return Array.from(this.departments.values());
  }

  consumeRenderQuota(workspaceId: string, rendersCount = 1): { success: boolean; remainingRenders: number } {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return { success: false, remainingRenders: 0 };

    const currentUsed = ws.rendersUsedThisMonth || 0;
    if (currentUsed + rendersCount > ws.quotaRendersPerMonth) {
      logger.warn(`[EnterpriseWorkspaceManager] Render quota exceeded for workspace '${workspaceId}'`);
      return { success: false, remainingRenders: ws.quotaRendersPerMonth - currentUsed };
    }

    ws.rendersUsedThisMonth = currentUsed + rendersCount;
    logger.info(`[EnterpriseWorkspaceManager] Consumed ${rendersCount} render(s) for workspace '${workspaceId}' (${ws.rendersUsedThisMonth}/${ws.quotaRendersPerMonth})`);
    return { success: true, remainingRenders: ws.quotaRendersPerMonth - ws.rendersUsedThisMonth };
  }

  deleteWorkspace(id: string): boolean {
    const deleted = this.workspaces.delete(id);
    if (deleted) {
      logger.info(`[EnterpriseWorkspaceManager] Deleted workspace '${id}'`);
    }
    return deleted;
  }
}

export const enterpriseWorkspaceManager = new EnterpriseWorkspaceManager();

