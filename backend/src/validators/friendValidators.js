const { body, param } = require('express-validator');

/**
 * Validators for POST /api/friends
 */
const createFriendValidators = [
  body('senderUID')
    .exists({ checkFalsy: true })
    .withMessage('senderUID is required')
    .isString()
    .trim(),

  body('receiverUID')
    .exists({ checkFalsy: true })
    .withMessage('receiverUID is required')
    .isString()
    .trim()
    .custom((value, { req }) => {
      if (value === req.body.senderUID) {
        throw new Error('receiverUID must not equal senderUID');
      }
      return true;
    }),
];

/**
 * Validators for PATCH /api/friends/:id
 */
const updateFriendValidators = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),

  body('status')
    .exists({ checkFalsy: true })
    .withMessage('status is required')
    .equals('accepted')
    .withMessage("status must be 'accepted'"),
];

module.exports = { createFriendValidators, updateFriendValidators };
