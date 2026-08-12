const router = require('express').Router();
const { verifyJWT } = require('../middleware/jwtAuth');

const { getAllGames, getGameById, createGame, deleteGame } = require('../controllers/gameController');
const { createGameValidators, gameIdValidators } = require('../validators/gameValidators');
const validate = require('../middleware/validate');

router.get('/', getAllGames);
router.get('/:id', gameIdValidators, validate, getGameById);
router.post('/', verifyJWT, createGameValidators, validate, createGame);
router.delete('/:id', verifyJWT, gameIdValidators, validate, deleteGame);

module.exports = router;
