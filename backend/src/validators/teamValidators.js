const { body, param } = require('express-validator');

const teamIdValidator = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
];

const createTeamValidators = [
  body('name')
    .exists({ checkFalsy: true })
    .withMessage('name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('name must be between 2 and 80 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 240 })
    .withMessage('description must be 240 characters or fewer'),
  body('color')
    .optional()
    .matches(/^#[0-9a-fA-F]{6}$/)
    .withMessage('color must be a six-digit hex color'),
  body('members')
    .isArray({ min: 1 })
    .withMessage('members must contain at least one player UID'),
  body('members.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('each member must be a player UID'),
];

const updateTeamValidators = [
  ...teamIdValidator,
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('name must be between 2 and 80 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 240 })
    .withMessage('description must be 240 characters or fewer'),
  body('color')
    .optional()
    .matches(/^#[0-9a-fA-F]{6}$/)
    .withMessage('color must be a six-digit hex color'),
  body('members')
    .optional()
    .isArray({ min: 1 })
    .withMessage('members must contain at least one player UID'),
  body('members.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('each member must be a player UID'),
];

module.exports = { teamIdValidator, createTeamValidators, updateTeamValidators };
