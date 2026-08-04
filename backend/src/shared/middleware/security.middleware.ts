import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppError, ErrorCode } from '@storyforge/shared';
import { logger } from '../../config/logger';

// ─── CSRF Double Submit Token Helper ───────────────────────────────────────────

export function generateCsrfToken(res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Readably accessible to frontend Axios / fetch headers
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Safe HTTP methods do not require CSRF token validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(AppError.forbidden('Invalid or missing CSRF token', ErrorCode.FORBIDDEN));
  }
  next();
}

// ─── Input & XSS Sanitization Middleware ──────────────────────────────────────

function sanitizeString(val: string): string {
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/javascript:/gi, '') // Strip inline JS protocols
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '');
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Prevent MongoDB NoSQL Query Injection ($where, $gt, etc.)
      if (key.startsWith('$')) continue;
      cleaned[key] = sanitizeObject(obj[key]);
    }
    return cleaned;
  }
  return obj;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
}

// ─── Suspicious Login Detector Middleware ─────────────────────────────────────

export function suspiciousLoginDetector(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip || '127.0.0.1';
  const ua = req.headers['user-agent'] || '';

  // Log automated scanner attempts
  if (ua.includes('sqlmap') || ua.includes('nikto') || ua.includes('nmap')) {
    logger.warn(`[Security] Suspicious security scanner detected from IP ${ip}: ${ua}`);
    return next(AppError.forbidden('Request blocked by security filter'));
  }
  next();
}
