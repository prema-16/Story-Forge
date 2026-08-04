import { logger } from '../config/logger';

export interface CommentThread {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  timecodeSeconds?: number;
  trackId?: string;
  content: string;
  mentions: string[]; // ['@alex', '@sarah']
  reactions: Record<string, string[]>; // '👍' -> ['user_1', 'user_2']
  resolved: boolean;
  replies: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export class ThreadCommentService {
  private threads = new Map<string, CommentThread[]>(); // projectId -> CommentThread[]

  createThread(threadData: Omit<CommentThread, 'id' | 'reactions' | 'resolved' | 'replies' | 'createdAt'>): CommentThread {
    const thread: CommentThread = {
      ...threadData,
      id: `th_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reactions: {},
      resolved: false,
      replies: [],
      createdAt: new Date().toISOString(),
    };

    if (!this.threads.has(thread.projectId)) {
      this.threads.set(thread.projectId, []);
    }
    this.threads.get(thread.projectId)!.push(thread);
    logger.info(`[ThreadCommentService] Created comment thread '${thread.id}' on project '${thread.projectId}'`);
    return thread;
  }

  addReply(threadId: string, reply: { authorId: string; authorName: string; content: string }): boolean {
    const thread = this.findThreadById(threadId);
    if (thread) {
      thread.replies.push({
        ...reply,
        id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      });
      logger.info(`[ThreadCommentService] Added reply to thread '${threadId}'`);
      return true;
    }
    return false;
  }

  resolveThread(threadId: string, resolved = true): boolean {
    const thread = this.findThreadById(threadId);
    if (thread) {
      thread.resolved = resolved;
      logger.info(`[ThreadCommentService] Marked thread '${threadId}' as resolved=${resolved}`);
      return true;
    }
    return false;
  }

  addReaction(threadId: string, emoji: string, userId: string): boolean {
    const thread = this.findThreadById(threadId);
    if (thread) {
      if (!thread.reactions[emoji]) {
        thread.reactions[emoji] = [];
      }
      if (!thread.reactions[emoji].includes(userId)) {
        thread.reactions[emoji].push(userId);
      }
      logger.info(`[ThreadCommentService] Added reaction '${emoji}' to thread '${threadId}' by user '${userId}'`);
      return true;
    }
    return false;
  }

  deleteThread(projectId: string, threadId: string): boolean {
    const list = this.threads.get(projectId);
    if (list) {
      const idx = list.findIndex((t) => t.id === threadId);
      if (idx !== -1) {
        list.splice(idx, 1);
        logger.info(`[ThreadCommentService] Deleted thread '${threadId}' from project '${projectId}'`);
        return true;
      }
    }
    return false;
  }

  getProjectThreads(projectId: string): CommentThread[] {
    return this.threads.get(projectId) || [];
  }

  findThreadById(threadId: string): CommentThread | undefined {
    for (const threads of this.threads.values()) {
      const target = threads.find((t) => t.id === threadId);
      if (target) return target;
    }
    return undefined;
  }
}

export const threadCommentService = new ThreadCommentService();

