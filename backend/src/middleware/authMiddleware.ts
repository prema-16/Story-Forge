import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { tokenService } from '../services/TokenService';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface JwtPayload {
  userId: string;
  role: string;
  jti: string;
  iat: number;
  exp: number;
}

/**
 * protect — verifies JWT, checks blacklist, and attaches user to request.
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
      }
      return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }

    // Check blacklist (for immediately invalidated tokens)
    if (decoded.jti) {
      const blacklisted = await tokenService.isBlacklisted(decoded.jti);
      if (blacklisted) {
        return next(new AppError('Token has been revoked', 401, 'TOKEN_REVOKED'));
      }
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * restrictTo — role-based access control.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }
    next();
  };
};

/**
 * requireCredits — validates user has enough credits before proceeding.
 */
export const requireCredits = (minimumCredits: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (req.user.credits < minimumCredits) {
      return next(
        new AppError(
          `Insufficient credits. Required: ${minimumCredits}, Available: ${req.user.credits}`,
          402,
          'INSUFFICIENT_CREDITS'
        )
      );
    }
    next();
  };
};
