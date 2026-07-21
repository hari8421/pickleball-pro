const router = require('express').Router();

const {
  getAllPlayers,
  getPlayerByUID,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/playerController');
const { createPlayerValidators, updatePlayerValidators } = require('../validators/playerValidators');
const validate = require('../middleware/validate');
const { requireAdmin } = require('../middleware/adminAuth');

router.get('/', getAllPlayers);
router.get('/:uid', getPlayerByUID);
router.post('/', requireAdmin, createPlayerValidators, validate, createPlayer);
router.patch('/:uid', requireAdmin, updatePlayerValidators, validate, updatePlayer);
router.delete('/:uid', requireAdmin, deletePlayer);

module.exports = router;
