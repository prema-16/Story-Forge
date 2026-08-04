import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { AppError } from '@storyforge/shared';

export { AppError };

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta']
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  } satisfies ApiResponse<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code?: string
): void => {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(code && { code }),
  } satisfies ApiResponse);
};

// Centralized error handler (Express error middleware)
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    code = 'SERVICE_UNAVAILABLE';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${statusCode}:`, err);
  } else {
    logger.warn(`[${req.method}] ${req.path} — ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(code && { code }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  } satisfies ApiResponse);
};

// Async wrapper to avoid try/catch in every controller
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
