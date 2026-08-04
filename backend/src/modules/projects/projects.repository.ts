import { BaseRepository } from '../../repositories/base.repository';
import { Project, IProject } from '../../models/Project';

export class ProjectsRepository extends BaseRepository<IProject> {
  constructor() {
    super(Project);
  }

  async findByUserId(userId: string, filter: { status?: string; search?: string; limit?: number; skip?: number } = {}) {
    const query: Record<string, unknown> = { userId };

    if (filter.status) query.status = filter.status;
    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    const total = await this.model.countDocuments(query);
    const projects = await this.model
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(filter.skip || 0)
      .limit(filter.limit || 12)
      .exec();

    return { projects, total };
  }

  async findByOrganization(orgId: string, limit = 50): Promise<IProject[]> {
    return this.model.find({ organizationId: orgId }).sort({ updatedAt: -1 }).limit(limit).exec();
  }

  async updateWorkflowStepStatus(projectId: string, stepName: string, status: string, creditsUsed = 0, error?: string): Promise<IProject | null> {
    return this.model.findOneAndUpdate(
      { _id: projectId, 'workflowSteps.step': stepName },
      {
        $set: {
          'workflowSteps.$.status': status,
          ...(error && { 'workflowSteps.$.error': error }),
          ...(status === 'completed' && { 'workflowSteps.$.completedAt': new Date() }),
          ...(status === 'running' && { 'workflowSteps.$.startedAt': new Date() }),
        },
        $inc: { creditsUsed },
      },
      { new: true }
    ).exec();
  }
}

export const projectsRepository = new ProjectsRepository();
