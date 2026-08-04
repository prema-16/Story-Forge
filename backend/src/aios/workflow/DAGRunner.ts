import { agentRegistryV2 } from '../agents/AgentRegistryV2';
import { AgentContextV2 } from '../agents/BaseAgentV2';
import { logger } from '../../config/logger';

export type NodeType = 'sequential' | 'parallel' | 'conditional' | 'retry' | 'loop';
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'skipped';

export interface DAGNode {
  id: string;
  name: string;
  type: NodeType;
  agentId: string;
  dependsOn: string[];
  status: NodeStatus;
  payload?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface DAGGraph {
  id: string;
  title: string;
  nodes: DAGNode[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export class DAGRunner {
  private executionLogs: string[] = [];

  /**
   * Execute a DAG workflow graph asynchronously with dependency resolution.
   */
  async executeDAG(graph: DAGGraph, context: AgentContextV2): Promise<DAGGraph> {
    graph.status = 'running';
    graph.updatedAt = new Date().toISOString();
    this.log(graph, `Started DAG workflow execution '${graph.title}' (${graph.id})`);

    const completedNodeIds = new Set<string>();

    while (graph.status === 'running') {
      const readyNodes = graph.nodes.filter(
        (node) =>
          node.status === 'pending' &&
          node.dependsOn.every((depId) => completedNodeIds.has(depId))
      );

      if (readyNodes.length === 0) {
        const remainingPending = graph.nodes.filter((n) => n.status === 'pending');
        const running = graph.nodes.filter((n) => n.status === 'running');

        if (remainingPending.length === 0 && running.length === 0) {
          graph.status = 'completed';
          this.log(graph, `DAG workflow '${graph.title}' completed successfully!`);
          break;
        }

        if (running.length === 0 && remainingPending.length > 0) {
          graph.status = 'failed';
          this.log(graph, `DAG deadlock detected: dependencies cannot be met for remaining nodes.`);
          break;
        }
      }

      // Execute ready nodes (parallel execution if multiple nodes ready)
      await Promise.all(
        readyNodes.map(async (node) => {
          await this.executeNode(graph, node, context, completedNodeIds);
        })
      );
    }

    graph.updatedAt = new Date().toISOString();
    return graph;
  }

  private async executeNode(graph: DAGGraph, node: DAGNode, context: AgentContextV2, completedSet: Set<string>): Promise<void> {
    node.status = 'running';
    node.startedAt = new Date().toISOString();
    this.log(graph, `Executing node '${node.name}' (${node.agentId})`);

    const agent = agentRegistryV2.get(node.agentId);
    if (!agent) {
      node.status = 'failed';
      node.error = `Agent '${node.agentId}' not found in registry`;
      this.log(graph, `Node '${node.name}' failed: ${node.error}`);
      return;
    }

    try {
      const result = await agent.execute(context, node.payload || {});
      if (result.success) {
        node.status = 'completed';
        node.result = result.data;
        node.completedAt = new Date().toISOString();
        completedSet.add(node.id);
        this.log(graph, `Node '${node.name}' completed in ${result.latencyMs}ms`);
      } else {
        node.status = 'failed';
        node.error = result.error || 'Agent execution failed';
        this.log(graph, `Node '${node.name}' failed: ${node.error}`);
      }
    } catch (err) {
      node.status = 'failed';
      node.error = (err as Error).message;
      this.log(graph, `Node '${node.name}' threw error: ${node.error}`);
    }
  }

  private log(graph: DAGGraph, message: string): void {
    const entry = `[${new Date().toISOString()}] [DAG:${graph.id}] ${message}`;
    this.executionLogs.push(entry);
    logger.info(entry);
  }

  getExecutionLogs(): string[] {
    return [...this.executionLogs];
  }
}

export const dagRunner = new DAGRunner();
