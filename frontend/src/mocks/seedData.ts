import type { Player, Game } from '../types';

export const seedPlayers: Player[] = [
  { _id: '1', uid: 'player-1', displayName: 'Alex Rivera', rankScore: 1820, gamesPlayed: 42, winRate: 0.71, createdAt: '2025-01-10T08:00:00Z' },
  { _id: '2', uid: 'player-2', displayName: 'Sam Chen', rankScore: 1755, gamesPlayed: 38, winRate: 0.66, createdAt: '2025-01-12T08:00:00Z' },
  { _id: '3', uid: 'player-3', displayName: 'Jordan Kim', rankScore: 1690, gamesPlayed: 31, winRate: 0.58, createdAt: '2025-01-15T08:00:00Z' },
  { _id: '4', uid: 'player-4', displayName: 'Morgan Lee', rankScore: 1640, gamesPlayed: 28, winRate: 0.54, createdAt: '2025-01-20T08:00:00Z' },
  { _id: '5', uid: 'player-5', displayName: 'Casey Patel', rankScore: 1600, gamesPlayed: 25, winRate: 0.52, createdAt: '2025-01-22T08:00:00Z' },
  { _id: '6', uid: 'player-6', displayName: 'Riley Wong', rankScore: 1555, gamesPlayed: 22, winRate: 0.50, createdAt: '2025-02-01T08:00:00Z' },
  { _id: '7', uid: 'player-7', displayName: 'Drew Martinez', rankScore: 1510, gamesPlayed: 19, winRate: 0.47, createdAt: '2025-02-05T08:00:00Z' },
  { _id: '8', uid: 'player-8', displayName: 'Avery Johnson', rankScore: 1480, gamesPlayed: 16, winRate: 0.44, createdAt: '2025-02-10T08:00:00Z' },
  { _id: '9', uid: 'player-9', displayName: 'Quinn Torres', rankScore: 1450, gamesPlayed: 14, winRate: 0.43, createdAt: '2025-02-15T08:00:00Z' },
  { _id: '10', uid: 'player-10', displayName: 'Blake Nguyen', rankScore: 1420, gamesPlayed: 12, winRate: 0.42, createdAt: '2025-02-20T08:00:00Z' },
];

export const seedGames: Game[] = Array.from({ length: 15 }, (_, i) => ({
  _id: `game-${i + 1}`,
  players: i % 3 === 0
    ? ['player-1', 'player-2', 'player-3', 'player-4']
    : ['player-1', 'player-2'],
  location: {
    type: 'Point',
    coordinates: [-122.4 + (i * 0.01), 37.77 + (i * 0.005)],
  },
  timestamp: new Date(Date.now() - i * 86400000).toISOString(),
  score: { homeTeam: 11 - (i % 5), awayTeam: 8 + (i % 4) },
  mediaURL: i % 4 === 0 ? `https://example.com/game-${i + 1}.mp4` : undefined,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));
