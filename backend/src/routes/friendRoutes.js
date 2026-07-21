const router = require('express').Router();

const {
  getFriendRequests,
  createFriendRequest,
  updateFriendRequest,
  deleteFriendRequest,
} = require('../controllers/friendController');
const { createFriendValidators, updateFriendValidators } = require('../validators/friendValidators');
const validate = require('../middleware/validate');

router.get('/', getFriendRequests);
router.post('/', createFriendValidators, validate, createFriendRequest);
router.patch('/:id', updateFriendValidators, validate, updateFriendRequest);
router.delete('/:id', validate, deleteFriendRequest);

module.exports = router;
