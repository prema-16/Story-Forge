import { DAGRunner, DAGGraph } from '../workflow/DAGRunner';
import { YOUTUBE_SHORTS_TEMPLATE } from '../workflow/WorkflowTemplates';
import { bootstrapProviders } from '../providers';
import { bootstrapAgentsV2 } from '../agents/AgentRegistryV2';

describe('AIOS Workflow Engine — DAG Execution Tests', () => {
  beforeEach(() => {
    bootstrapProviders();
    bootstrapAgentsV2();
  });

  it('should execute a multi-step DAG workflow with parallel branches successfully', async () => {
    const runner = new DAGRunner();
    const testGraph: DAGGraph = JSON.parse(JSON.stringify(YOUTUBE_SHORTS_TEMPLATE));

    const result = await runner.executeDAG(testGraph, {
      projectId: 'test_project_123',
      userId: 'test_user_456',
    });

    expect(result.status).toBe('completed');
    expect(result.nodes.every((n) => n.status === 'completed')).toBe(true);
    expect(runner.getExecutionLogs().length).toBeGreaterThan(0);
  });
});
