import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../../../packages/shared/src/types';
import { db } from '../db/inMemoryDb';
import { config } from '../config/env';

const JWT_SECRET = config.jwt.secret || 'jansetu-gov-secure-jwt-production-secret-key-2026';
const JWT_REFRESH_SECRET = config.jwt.refreshSecret || 'jansetu-refresh-secret-token-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

export interface TokenPayload {
  id: string;
  name: string;
  role: UserRole;
  district?: string;
  state?: string;
  officerId?: string;
}

/**
 * Generates both access token and refresh token for authenticated sessions
 */
export function generateTokens(user: User): { accessToken: string; refreshToken: string; expiresIn: string } {
  const payload: TokenPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    district: user.district,
    state: user.state,
    officerId: user.officerId,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    expiresIn: '1d',
  };
}

export function generateToken(user: User): string {
  return generateTokens(user).accessToken;
}

export function verifyRefreshToken(token: string): { id: string; role: UserRole } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; role: UserRole };
  } catch {
    return null;
  }
}

/**
 * Authentication Middleware: Validates Bearer JWT Access Token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If demo header passed in local test client without bearer token, resolve demo account
    if (req.headers['x-demo-role']) {
      const demoRole = req.headers['x-demo-role'] as UserRole;
      const demoUser = db.getAllUsers().find((u) => u.role === demoRole) || db.getAllUsers()[0];
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({
      error: 'Authentication token required. Please sign in.',
      code: 'UNAUTHENTICATED',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'User session no longer valid or user deleted.',
        code: 'USER_NOT_FOUND',
      });
    }
    const { passwordHash: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Invalid or expired access token. Please re-authenticate.',
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
    });
  }
}

/**
 * Optional Authentication Middleware: populates req.user if token present, does not block if absent
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (req.headers['x-demo-role']) {
      const demoRole = req.headers['x-demo-role'] as UserRole;
      const demoUser = db.getAllUsers().find((u) => u.role === demoRole);
      if (demoUser) req.user = demoUser;
    }
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = db.findUserById(decoded.id);
    if (user) {
      const { passwordHash: _, ...safeUser } = user;
      req.user = safeUser;
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

/**
 * RBAC Authorization: Enforces Role & Geographic Scope
 * Returns 403 Forbidden if user role is insufficient
 */
export function authorizeRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required for this operation.',
        code: 'UNAUTHENTICATED',
      });
    }

    if (req.user.role === 'CITIZEN' && !allowedRoles.includes('CITIZEN')) {
      return res.status(403).json({
        error: 'Access Forbidden: Citizen accounts are not authorized to access Government Portal services.',
        code: 'FORBIDDEN_CITIZEN_ACCESS',
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: `Access Forbidden: Role ${req.user.role} does not have required permissions for this resource.`,
        code: 'ROLE_NOT_AUTHORIZED',
      });
    }

    next();
  };
}

/**
 * Enforces Government Officer access (Rejecting citizens with 403 Forbidden)
 */
export const authorizeGovernment = authorizeRole([
  'DISTRICT_OFFICER',
  'STATE_OFFICER',
  'NATIONAL_OFFICER',
  'ANALYST',
  'ADMIN',
]);
