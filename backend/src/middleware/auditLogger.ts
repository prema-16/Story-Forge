import { Request, Response, NextFunction } from 'express';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { AuthRequest } from './authMiddleware';
import { logger } from '../config/logger';

/**
 * createAuditLog — fire-and-forget audit log writer.
 * Never throws — logging failures must not affect the request.
 */
export async function createAuditLog(
  req: Request,
  action: AuditAction,
  options: {
    resource?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
  } = {}
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    await AuditLog.create({
      userId: authReq.user?._id,
      action,
      resource: options.resource,
      resourceId: options.resourceId,
      metadata: options.metadata,
      ip: (Array.isArray(req.ip) ? req.ip[0] : req.ip) || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      success: options.success ?? true,
      errorMessage: options.errorMessage,
    });
  } catch (err) {
    logger.warn('[AuditLog] Failed to write audit log:', (err as Error).message);
  }
}

/**
 * auditMiddleware — factory to create a middleware that logs after the response.
 */
export function auditMiddleware(action: AuditAction, resource?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalEnd = res.end.bind(res);

    (res as any).end = function (...args: Parameters<typeof originalEnd>) {
      const success = res.statusCode < 400;
      createAuditLog(req, action, {
        resource,
        resourceId: req.params.id as string | undefined,
        success,
      });
      return originalEnd(...args);
    };

    next();
  };
}
