import { http, HttpResponse } from 'msw';
import { seedPlayers, seedGames } from './seedData';
import type { Game } from '../types';

const games = [...seedGames];

export const handlers = [
  http.get('/api/players', () => {
    return HttpResponse.json(seedPlayers);
  }),

  http.get('/api/games', () => {
    return HttpResponse.json(games);
  }),

  http.post('/api/games', async ({ request }) => {
    const body = (await request.json()) as Omit<Game, '_id' | 'createdAt'>;
    const newGame: Game = {
      ...body,
      _id: `game-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    games.unshift(newGame);
    return HttpResponse.json(newGame, { status: 201 });
  }),
];
