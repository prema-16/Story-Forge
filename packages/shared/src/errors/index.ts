/**
 * @storyforge/shared — Error Classes & Codes
 *
 * Shared error infrastructure. Backend throws these; frontend catches and
 * maps them to user-facing messages.
 */

// ─── Error Codes ──────────────────────────────────────────────────────────────

export enum ErrorCode {
  // Auth
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_ID = 'INVALID_ID',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Generation
  GENERATION_IN_PROGRESS = 'GENERATION_IN_PROGRESS',
  GENERATION_FAILED = 'GENERATION_FAILED',
  STEP_DEPENDENCY_NOT_MET = 'STEP_DEPENDENCY_NOT_MET',

  // Infrastructure
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUEUE_ERROR = 'QUEUE_ERROR',

  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

// ─── User-Facing Error Messages ───────────────────────────────────────────────

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'Please sign in to continue.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.TOKEN_REVOKED]: 'This session has been revoked. Please sign in again.',
  [ErrorCode.INVALID_TOKEN]: 'Invalid authentication token.',
  [ErrorCode.EMAIL_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.ACCOUNT_DEACTIVATED]: 'Your account has been deactivated. Please contact support.',

  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.INSUFFICIENT_CREDITS]: 'You do not have enough credits for this operation.',

  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_ID]: 'Invalid resource ID format.',

  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.PROJECT_NOT_FOUND]: 'Project not found.',
  [ErrorCode.USER_NOT_FOUND]: 'User not found.',

  [ErrorCode.GENERATION_IN_PROGRESS]: 'Generation is already in progress for this step.',
  [ErrorCode.GENERATION_FAILED]: 'AI generation failed. Please try again.',
  [ErrorCode.STEP_DEPENDENCY_NOT_MET]: 'Complete the required previous steps first.',

  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again shortly.',
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ErrorCode.QUEUE_ERROR]: 'Failed to queue the generation job. Please try again.',

  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment before trying again.',
};

// ─── AppError Class ───────────────────────────────────────────────────────────

/**
 * Structured operational error — thrown by backend, parsed by frontend.
 * Extends native Error so it works with try/catch and instanceof checks.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode | string;
  readonly isOperational: boolean;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.context = context;
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /** Factory: 400 Bad Request */
  static badRequest(message: string, code = ErrorCode.VALIDATION_ERROR): AppError {
    return new AppError(message, 400, code);
  }

  /** Factory: 401 Unauthorized */
  static unauthorized(message: string, code = ErrorCode.AUTH_REQUIRED): AppError {
    return new AppError(message, 401, code);
  }

  /** Factory: 403 Forbidden */
  static forbidden(message = 'Forbidden', code = ErrorCode.FORBIDDEN): AppError {
    return new AppError(message, 403, code);
  }

  /** Factory: 404 Not Found */
  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }

  /** Factory: 409 Conflict */
  static conflict(message: string, code = ErrorCode.EMAIL_EXISTS): AppError {
    return new AppError(message, 409, code);
  }

  /** Factory: 402 Payment Required (Insufficient Credits) */
  static insufficientCredits(required: number, available: number): AppError {
    return new AppError(
      `Insufficient credits. Required: ${required}, Available: ${available}`,
      402,
      ErrorCode.INSUFFICIENT_CREDITS,
      { required, available },
    );
  }

  /** Factory: 503 Service Unavailable */
  static serviceUnavailable(service: string): AppError {
    return new AppError(`${service} is temporarily unavailable`, 503, ErrorCode.SERVICE_UNAVAILABLE);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      context: this.context,
    };
  }
}

// ─── API Error Parser (Frontend) ──────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  stack?: string;
}

/**
 * Extract a user-friendly error message from an API error response.
 * Used in frontend catch blocks.
 */
export function getApiErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (!err || typeof err !== 'object') return fallback;

  // Axios error shape
  const axiosErr = err as { response?: { data?: ApiErrorResponse } };
  if (axiosErr.response?.data?.error) {
    return axiosErr.response.data.error;
  }

  // Native Error
  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
}

/**
 * Get the error code from an API error response.
 */
export function getApiErrorCode(err: unknown): ErrorCode | string | null {
  if (!err || typeof err !== 'object') return null;
  const axiosErr = err as { response?: { data?: ApiErrorResponse } };
  return (axiosErr.response?.data?.code as ErrorCode) ?? null;
}
