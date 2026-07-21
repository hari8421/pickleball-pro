const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyJWT } = require('../middleware/jwtAuth');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

/**
 * POST /api/auth/login
 * Login endpoint - returns JWT token
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/verify
 * Verify token endpoint - returns admin info if token is valid
 */
async function verifyToken(req, res, next) {
  try {
    // Token is already verified by middleware
    const admin = await Admin.findById(req.admin.adminId).select('-password');
    res.json({
      success: true,
      admin,
    });
  } catch (err) {
    next(err);
  }
}

// Validators
const loginValidators = [
  body('username')
    .exists({ checkFalsy: true })
    .withMessage('username is required')
    .isString()
    .trim(),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('password is required')
    .isString(),
];

// Routes
router.post('/login', loginValidators, validate, login);
router.get('/verify', verifyJWT, verifyToken);

module.exports = router;



