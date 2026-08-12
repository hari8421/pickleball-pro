const router = require('express').Router();
const { verifyJWT } = require('../middleware/jwtAuth');
const validate = require('../middleware/validate');
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require('../controllers/teamController');
const {
  teamIdValidator,
  createTeamValidators,
  updateTeamValidators,
} = require('../validators/teamValidators');

router.get('/', getAllTeams);
router.get('/:id', teamIdValidator, validate, getTeamById);
router.post('/', verifyJWT, createTeamValidators, validate, createTeam);
router.patch('/:id', verifyJWT, updateTeamValidators, validate, updateTeam);
router.delete('/:id', verifyJWT, teamIdValidator, validate, deleteTeam);

module.exports = router;
