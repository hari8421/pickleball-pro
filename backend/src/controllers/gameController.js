const Game = require('../models/Game');
const Player = require('../models/Player');
const Team = require('../models/Team');

function isAdmin(req) {
  return Boolean(req.auth?.adminId);
}

function getResultMap(game) {
  const homeScore = game.score.homeTeam;
  const awayScore = game.score.awayTeam;
  const homeResult = homeScore === awayScore ? 0.5 : homeScore > awayScore ? 1 : 0;
  const awayResult = homeScore === awayScore ? 0.5 : awayScore > homeScore ? 1 : 0;
  return {
    ...Object.fromEntries((game.players || []).map((uid) => [uid, null])),
    ...Object.fromEntries((game.homePlayerUIDs || []).map((uid) => [uid, homeResult])),
    ...Object.fromEntries((game.awayPlayerUIDs || []).map((uid) => [uid, awayResult])),
  };
}

async function adjustPlayerStats(game, direction) {
  const resultMap = getResultMap(game);
  const playerUIDs = Object.keys(resultMap);
  if (playerUIDs.length === 0) return;

  const players = await Player.find({ uid: { $in: playerUIDs } });
  await Promise.all(players.map(async (player) => {
    const oldGames = player.gamesPlayed;
    const oldWins = player.winRate * oldGames;
    const nextGames = Math.max(0, oldGames + direction);
    const result = resultMap[player.uid];
    const nextWins = Math.max(0, oldWins + (typeof result === 'number' ? result * direction : 0));

    player.gamesPlayed = nextGames;
    player.winRate = nextGames === 0 ? 0.5 : Math.min(1, Math.max(0, nextWins / nextGames));
    await player.save();
  }));
}

/**
 * GET /api/games
 * Supports: page, limit, playerUID (filter games where playerUID is in players array)
 */
async function getAllGames(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.playerUID) filter.players = req.query.playerUID;

    const [data, total] = await Promise.all([
      Game.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Game.countDocuments(filter),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getGameById(req, res, next) {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      const error = new Error('Game not found');
      error.status = 404;
      return next(error);
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
}

async function createGame(req, res, next) {
  try {
    const { homeTeamId, awayTeamId } = req.body;
    let homePlayerUIDs = [];
    let awayPlayerUIDs = [];

    if ((homeTeamId && !awayTeamId) || (!homeTeamId && awayTeamId)) {
      const error = new Error('Both homeTeamId and awayTeamId are required when associating a game with teams');
      error.status = 422;
      return next(error);
    }

    if (homeTeamId && awayTeamId) {
      if (homeTeamId === awayTeamId) {
        const error = new Error('A game must use two different teams');
        error.status = 422;
        return next(error);
      }

      const teams = await Team.find({ _id: { $in: [homeTeamId, awayTeamId] } });
      if (teams.length !== 2) {
        const error = new Error('One or more selected teams do not exist');
        error.status = 422;
        return next(error);
      }

      const selectedPlayers = new Set(req.body.players);
      const homeTeam = teams.find((team) => team._id.toString() === homeTeamId);
      const awayTeam = teams.find((team) => team._id.toString() === awayTeamId);
      homePlayerUIDs = homeTeam.members.filter((uid) => selectedPlayers.has(uid));
      awayPlayerUIDs = awayTeam.members.filter((uid) => selectedPlayers.has(uid));
    }

    const game = new Game({
      ...req.body,
      homePlayerUIDs,
      awayPlayerUIDs,
      createdBy: req.auth?.username,
    });
    const saved = await game.save();

    if (saved.players.length > 0) {
      await adjustPlayerStats(saved, 1);
      saved.statsApplied = true;
      await saved.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

async function deleteGame(req, res, next) {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      const error = new Error('Game not found');
      error.status = 404;
      return next(error);
    }

    const isOwner = game.createdBy && game.createdBy === req.auth?.username;
    if (!isOwner && !isAdmin(req)) {
      const error = new Error('You do not have permission to delete this game');
      error.status = 403;
      return next(error);
    }

    if (game.statsApplied) await adjustPlayerStats(game, -1);
    await game.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllGames, getGameById, createGame, deleteGame };
