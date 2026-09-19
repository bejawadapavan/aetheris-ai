import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aetheris-production-jwt-access-secret-token-key-2026';

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyTokenString(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

/**
 * Optional Auth Middleware:
 * If an Authorization header or API key is passed, populates req.user.
 * If not, allows the request to continue as guest.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (token) {
    const decoded = verifyTokenString(token);
    if (decoded) {
      req.user = decoded;
    }
  } else if (apiKeyHeader && isDbConnected()) {
    try {
      const user = await User.findOne({ apiKey: apiKeyHeader, isActive: true });
      if (user) {
        req.user = user.toSafeObject();
      }
    } catch (e) {
      // ignore
    }
  }

  next();
}

/**
 * Strict Auth Middleware:
 * Requires valid Bearer JWT or active API Key, otherwise returns 401 Unauthorized.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  if (token) {
    const decoded = verifyTokenString(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }

  if (apiKeyHeader && isDbConnected()) {
    try {
      const user = await User.findOne({ apiKey: apiKeyHeader, isActive: true });
      if (user) {
        req.user = user.toSafeObject();
        return next();
      }
    } catch (e) {
      // ignore
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or inactive API key provided.',
    });
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required. Provide "Authorization: Bearer <token>" or "x-api-key" header.',
  });
}

/**
 * Role-based Authorization Middleware:
 * Requires user to have a specific role (e.g. 'admin').
 */
export function requireRole(allowedRoles = ['admin']) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required before checking role authorization.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Requires role: [${roles.join(', ')}], current role: ${req.user.role}`,
      });
    }

    next();
  };
}
