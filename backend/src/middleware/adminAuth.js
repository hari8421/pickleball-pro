const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to check if the requesting user is an admin
 * Supports two authentication methods:
 * 1. JWT token in Authorization header: "Bearer <token>"
 * 2. adminUID in query parameter or body (for backwards compatibility)
 */
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Method 1: Try JWT authentication first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        req.isJWTAuth = true;
        return next();
      } catch (jwtErr) {
        const err = new Error('Invalid or expired token');
        err.status = 401;
        return next(err);
      }
    }

    // Method 2: Fall back to adminUID parameter (backwards compatibility)
    const adminUID = req.query.adminUID || req.body.adminUID;

    if (!adminUID) {
      const err = new Error('Admin authentication required. Provide JWT token in Authorization header or adminUID parameter');
      err.status = 401;
      return next(err);
    }

    const admin = await Player.findOne({ uid: adminUID });

    if (!admin || !admin.isAdmin) {
      const err = new Error('Unauthorized: Admin access required');
      err.status = 403;
      return next(err);
    }

    req.admin = admin;
    req.isJWTAuth = false;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdmin };

