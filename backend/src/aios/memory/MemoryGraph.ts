import { logger } from '../../config/logger';

export type MemoryCategory =
  | 'brand'
  | 'audience'
  | 'writing_style'
  | 'voice_style'
  | 'thumbnail_style'
  | 'prompt_history'
  | 'generated_scripts'
  | 'user_corrections'
  | 'channel_analytics'
  | 'seo_history'
  | 'agent_notes';

export interface MemoryNode {
  id: string;
  projectId?: string;
  organizationId?: string;
  category: MemoryCategory;
  key: string;
  value: unknown;
  embedding?: number[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export class MemoryGraph {
  private nodes = new Map<string, MemoryNode>();

  /**
   * Upsert a memory node in the graph.
   */
  async set(node: Omit<MemoryNode, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<MemoryNode> {
    const id = node.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const fullNode: MemoryNode = {
      id,
      projectId: node.projectId,
      organizationId: node.organizationId,
      category: node.category,
      key: node.key,
      value: node.value,
      tags: node.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    this.nodes.set(id, fullNode);
    logger.debug(`[MemoryGraph] Saved memory node '${node.key}' in category '${node.category}' (${id})`);
    return fullNode;
  }

  /**
   * Get a memory node by category and key.
   */
  async get(category: MemoryCategory, key: string, projectId?: string): Promise<MemoryNode | null> {
    for (const node of this.nodes.values()) {
      if (node.category === category && node.key === key) {
        if (!projectId || node.projectId === projectId) {
          return node;
        }
      }
    }
    return null;
  }

  /**
   * Perform semantic vector / keyword retrieval over memory nodes.
   */
  async querySemantic(query: string, category?: MemoryCategory, limit = 5): Promise<MemoryNode[]> {
    const queryLower = query.toLowerCase();
    const results: Array<{ node: MemoryNode; score: number }> = [];

    for (const node of this.nodes.values()) {
      if (category && node.category !== category) continue;

      let score = 0;
      const strVal = typeof node.value === 'string' ? node.value : JSON.stringify(node.value);

      if (node.key.toLowerCase().includes(queryLower)) score += 10;
      if (strVal.toLowerCase().includes(queryLower)) score += 5;
      if (node.tags.some((t) => t.toLowerCase().includes(queryLower))) score += 8;

      if (score > 0) {
        results.push({ node, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => r.node);
  }

  /**
   * Get all brand memory context for prompt compiling.
   */
  async getBrandContext(organizationId?: string, projectId?: string): Promise<Record<string, unknown>> {
    const brandMemory: Record<string, unknown> = {};
    for (const node of this.nodes.values()) {
      if (
        node.category === 'brand' ||
        node.category === 'writing_style' ||
        node.category === 'voice_style' ||
        node.category === 'thumbnail_style'
      ) {
        brandMemory[node.key] = node.value;
      }
    }
    return brandMemory;
  }
}

export const memoryGraph = new MemoryGraph();
