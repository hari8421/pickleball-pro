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

router.get('/', getAllPlayers);
router.get('/:uid', getPlayerByUID);
router.post('/', createPlayerValidators, validate, createPlayer);
router.patch('/:uid', updatePlayerValidators, validate, updatePlayer);
router.delete('/:uid', deletePlayer);

module.exports = router;
