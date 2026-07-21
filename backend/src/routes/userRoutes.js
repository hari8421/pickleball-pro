const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');
const { verifyJWT } = require('../middleware/jwtAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Validators
const registerValidators = [
  body('username').exists({ checkFalsy: true }).withMessage('username is required').isString().trim(),
  body('password').exists({ checkFalsy: true }).withMessage('password is required').isString().isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('displayName').exists({ checkFalsy: true }).withMessage('displayName is required').isString().isLength({ min: 2 }).trim(),
  body('playingLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('invalid playing level'),
];

const loginValidators = [
  body('username').exists({ checkFalsy: true }).withMessage('username is required').isString().trim(),
  body('password').exists({ checkFalsy: true }).withMessage('password is required').isString(),
];

const updateMeValidators = [
  body('displayName').optional().isString().isLength({ min: 2 }).withMessage('displayName must be at least 2 characters').trim(),
  body('playingLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('invalid playing level'),
];

/** POST /api/users/register */
async function register(req, res, next) {
  try {
    const { username, password, displayName, playingLevel } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      const err = new Error('Username already taken');
      err.status = 409;
      return next(err);
    }

    const user = new User({ username, password, displayName, playingLevel });
    const saved = await user.save();

    res.status(201).json({
      id: saved._id,
      username: saved.username,
      displayName: saved.displayName,
      playingLevel: saved.playingLevel,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/users/login */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }

    const match = await user.comparePassword(password);
    if (!match) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      return next(err);
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({ token, user: { id: user._id, username: user.username, displayName: user.displayName, playingLevel: user.playingLevel } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users - public list (only displayName and playingLevel exposed) */
async function listPublic(req, res, next) {
  try {
    const users = await User.find().select('username displayName playingLevel createdAt');
    // Map to public view
    const publicList = users.map((u) => ({ username: u.username, displayName: u.displayName, playingLevel: u.playingLevel }));
    res.json({ data: publicList });
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/me - returns full profile for authenticated user */
async function me(req, res, next) {
  try {
    // verifyJWT middleware attaches req.auth.userId or req.user
    const auth = req.auth || req.user || req.admin;
    if (!auth || !auth.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }

    const user = await User.findById(auth.userId).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/users/me - update own profile (displayName, playingLevel) */
async function updateMe(req, res, next) {
  try {
    const auth = req.auth || req.user || req.admin;
    if (!auth || !auth.userId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }

    const { displayName, playingLevel } = req.body;

    const updates = {};
    if (typeof displayName !== 'undefined') updates.displayName = displayName;
    if (typeof playingLevel !== 'undefined') updates.playingLevel = playingLevel;

    const user = await User.findByIdAndUpdate(auth.userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

/** GET /api/users/:username - public profile (only displayName and playingLevel) */
async function getByUsername(req, res, next) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json({ username: user.username, displayName: user.displayName, playingLevel: user.playingLevel });
  } catch (err) {
    next(err);
  }
}

// Routes
router.post('/register', registerValidators, validate, register);
router.post('/login', loginValidators, validate, login);
router.get('/', listPublic);
router.get('/me', verifyJWT, me);
router.patch('/me', verifyJWT, updateMeValidators, validate, updateMe);
router.get('/:username', getByUsername);

module.exports = router;

