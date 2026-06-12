import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Authentication middleware - protects routes
 * Requires valid JWT token in Authorization header
 */
export async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't block if missing
 * Useful for endpoints that work for both guests and logged-in users
 */
export async function optionalAuth(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue as guest
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Try to verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (tokenError) {
      // Invalid token - continue as guest
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // On error, continue as guest
    req.user = null;
    next();
  }
}

/**
 * Admin authentication middleware
 * Requires user to be authenticated AND have admin role
 */
export async function requireAdmin(req, res, next) {
  try {
    // First authenticate the user
    await authenticate(req, res, () => {});

    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed.',
    });
  }
}
