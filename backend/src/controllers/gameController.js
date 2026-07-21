const Game = require('../models/Game');

/**
 * GET /api/games
 * Supports: page, limit, playerUID (filter games where playerUID is in players array)
 * Returns: { data, total, page, limit, totalPages }
 */
async function getAllGames(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.playerUID) {
      filter.players = req.query.playerUID;
    }

    const [data, total] = await Promise.all([
      Game.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Game.countDocuments(filter),
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
 * GET /api/games/:id
 * Returns 404 if game not found.
 */
async function getGameById(req, res, next) {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      const err = new Error('Game not found');
      err.status = 404;
      return next(err);
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/games
 * Returns 201 on success.
 */
async function createGame(req, res, next) {
  try {
    const game = new Game(req.body);
    const saved = await game.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/games/:id
 * Returns 404 if not found, 204 on success.
 */
async function deleteGame(req, res, next) {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      const err = new Error('Game not found');
      err.status = 404;
      return next(err);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllGames, getGameById, createGame, deleteGame };
