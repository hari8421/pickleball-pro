const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token
 * Token can be in Authorization header: "Bearer <token>"
 */
async function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('No token provided');
      err.status = 401;
      return next(err);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Attach generic auth payload
      req.auth = decoded;

      // Convenience aliases for admin/user if present
      if (decoded.adminId) req.admin = decoded;
      if (decoded.userId) req.user = decoded;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        const err = new Error('Token expired');
        err.status = 401;
        return next(err);
      }
      const err = new Error('Invalid token');
      err.status = 401;
      return next(err);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyJWT };

