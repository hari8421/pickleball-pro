const router = require('express').Router();
const { verifyJWT } = require('../middleware/jwtAuth');

const {
  getFriendRequests,
  createFriendRequest,
  updateFriendRequest,
  deleteFriendRequest,
} = require('../controllers/friendController');
const { createFriendValidators, updateFriendValidators } = require('../validators/friendValidators');
const validate = require('../middleware/validate');

router.get('/', verifyJWT, getFriendRequests);
router.post('/', verifyJWT, createFriendValidators, validate, createFriendRequest);
router.patch('/:id', verifyJWT, updateFriendValidators, validate, updateFriendRequest);
router.delete('/:id', verifyJWT, validate, deleteFriendRequest);

module.exports = router;
