const { body, param } = require('express-validator');

/**
 * Validators for POST /api/games
 */
const createGameValidators = [
  body('players')
    .isArray({ min: 2 })
    .withMessage('players must be an array with at least 2 entries'),

  body('players.*')
    .isString()
    .withMessage('each player must be a string UID')
    .trim(),

  body('location.type')
    .exists({ checkFalsy: true })
    .withMessage('location.type is required')
    .equals('Point')
    .withMessage("location.type must equal 'Point'"),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('location.coordinates must be an array of exactly 2 numbers [longitude, latitude]'),

  body('location.coordinates.*')
    .isFloat()
    .withMessage('each coordinate must be a number'),

  body('homeTeamId')
    .optional()
    .isMongoId()
    .withMessage('homeTeamId must be a valid MongoDB ObjectId'),

  body('awayTeamId')
    .optional()
    .isMongoId()
    .withMessage('awayTeamId must be a valid MongoDB ObjectId'),

  body('score.homeTeam')
    .exists({ checkNull: true })
    .withMessage('score.homeTeam is required')
    .isInt({ min: 0 })
    .withMessage('score.homeTeam must be an integer >= 0'),

  body('score.awayTeam')
    .exists({ checkNull: true })
    .withMessage('score.awayTeam is required')
    .isInt({ min: 0 })
    .withMessage('score.awayTeam must be an integer >= 0'),
];

/**
 * Validator for DELETE /api/games/:id — MongoDB ObjectId check
 */
const gameIdValidators = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
];

module.exports = { createGameValidators, gameIdValidators };
