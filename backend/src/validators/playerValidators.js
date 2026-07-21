const { body, param } = require('express-validator');

/**
 * Validators for POST /api/players
 */
const createPlayerValidators = [
  body('uid')
    .exists({ checkFalsy: true })
    .withMessage('uid is required')
    .isString()
    .withMessage('uid must be a string')
    .trim(),

  body('displayName')
    .exists({ checkFalsy: true })
    .withMessage('displayName is required')
    .isString()
    .withMessage('displayName must be a string')
    .isLength({ min: 2 })
    .withMessage('displayName must be at least 2 characters')
    .trim(),

  body('rankScore')
    .optional()
    .isFloat({ min: 0, max: 9999 })
    .withMessage('rankScore must be a number between 0 and 9999'),

  body('winRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('winRate must be a number between 0 and 1'),

   body('gamesPlayed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('gamesPlayed must be an integer >= 0'),

  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
];

/**
 * Validators for PATCH /api/players/:uid — partial update
 */
const updatePlayerValidators = [
  param('uid').isString().trim().notEmpty().withMessage('uid param is required'),

  body('displayName')
    .optional()
    .isString()
    .isLength({ min: 2 })
    .withMessage('displayName must be at least 2 characters')
    .trim(),

  body('rankScore')
    .optional()
    .isFloat({ min: 0, max: 9999 })
    .withMessage('rankScore must be a number between 0 and 9999'),

  body('winRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('winRate must be a number between 0 and 1'),

  body('gamesPlayed')
    .optional()
    .isInt({ min: 0 })
    .withMessage('gamesPlayed must be an integer >= 0'),

  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
];

module.exports = { createPlayerValidators, updatePlayerValidators };
