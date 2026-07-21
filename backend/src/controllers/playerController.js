const Player = require('../models/Player');

/**
 * GET /api/players
 * Supports: sort (rankScore|winRate|gamesPlayed), order (asc|desc), page, limit
 * Returns: { data, total, page, limit, totalPages }
 */
async function getAllPlayers(req, res, next) {
  try {
    const ALLOWED_SORT = ['rankScore', 'winRate', 'gamesPlayed'];
    const sortField = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : 'rankScore';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Player.find().sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
      Player.countDocuments(),
    ]);

    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/players/:uid
 * Returns 404 if player not found.
 */
async function getPlayerByUID(req, res, next) {
  try {
    const player = await Player.findOne({ uid: req.params.uid });
    if (!player) {
      const err = new Error('Player not found');
      err.status = 404;
      return next(err);
    }
    res.json(player);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/players
 * Returns 409 if a player with that uid already exists.
 * Returns 201 on success.
 */
async function createPlayer(req, res, next) {
  try {
    const existing = await Player.findOne({ uid: req.body.uid });
    if (existing) {
      const err = new Error(`Player with uid '${req.body.uid}' already exists`);
      err.status = 409;
      return next(err);
    }

    const player = new Player(req.body);
    const saved = await player.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/players/:uid
 * Partial update — only applies provided fields.
 * Returns 404 if player not found.
 */
async function updatePlayer(req, res, next) {
  try {
    // Strip fields that should not be patched directly
    const { uid, _id, __v, createdAt, updatedAt, ...allowedUpdates } = req.body;

    const player = await Player.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!player) {
      const err = new Error('Player not found');
      err.status = 404;
      return next(err);
    }

    res.json(player);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/players/:uid
 * Returns 404 if not found, 204 on success.
 */
async function deletePlayer(req, res, next) {
  try {
    const player = await Player.findOneAndDelete({ uid: req.params.uid });
    if (!player) {
      const err = new Error('Player not found');
      err.status = 404;
      return next(err);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllPlayers, getPlayerByUID, createPlayer, updatePlayer, deletePlayer };
