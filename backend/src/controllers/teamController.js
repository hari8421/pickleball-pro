const Team = require('../models/Team');
const Player = require('../models/Player');

function getRequesterUID(req) {
  return req.auth?.username || '';
}

function isAdmin(req) {
  return Boolean(req.auth?.adminId);
}

async function validateMembers(members) {
  const uniqueMembers = [...new Set(members)];
  const players = await Player.find({ uid: { $in: uniqueMembers } }).select('uid');
  const found = new Set(players.map((player) => player.uid));
  const missing = uniqueMembers.filter((uid) => !found.has(uid));

  if (missing.length > 0) {
    const error = new Error(`Unknown player UID(s): ${missing.join(', ')}`);
    error.status = 422;
    throw error;
  }

  return uniqueMembers;
}

function canManage(team, req) {
  return isAdmin(req) || team.ownerUID === getRequesterUID(req);
}

async function getAllTeams(req, res, next) {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json({ data: teams });
  } catch (err) {
    next(err);
  }
}

async function getTeamById(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      const error = new Error('Team not found');
      error.status = 404;
      return next(error);
    }
    res.json(team);
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const members = await validateMembers(req.body.members);
    const team = await Team.create({
      name: req.body.name,
      description: req.body.description || '',
      color: req.body.color || '#16a34a',
      ownerUID: getRequesterUID(req),
      members,
    });
    res.status(201).json(team);
  } catch (err) {
    if (err.code === 11000) {
      err.status = 409;
      err.message = 'A team with this name already exists';
    }
    next(err);
  }
}

async function updateTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      const error = new Error('Team not found');
      error.status = 404;
      return next(error);
    }
    if (!canManage(team, req)) {
      const error = new Error('You do not have permission to manage this team');
      error.status = 403;
      return next(error);
    }

    const updates = {};
    if (typeof req.body.name !== 'undefined') updates.name = req.body.name;
    if (typeof req.body.description !== 'undefined') updates.description = req.body.description;
    if (typeof req.body.color !== 'undefined') updates.color = req.body.color;
    if (typeof req.body.members !== 'undefined') {
      updates.members = await validateMembers(req.body.members);
    }

    const updated = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      err.status = 409;
      err.message = 'A team with this name already exists';
    }
    next(err);
  }
}

async function deleteTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      const error = new Error('Team not found');
      error.status = 404;
      return next(error);
    }
    if (!canManage(team, req)) {
      const error = new Error('You do not have permission to delete this team');
      error.status = 403;
      return next(error);
    }

    await team.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
