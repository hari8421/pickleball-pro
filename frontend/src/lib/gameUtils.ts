import type { Game } from '../types';

export function filterGamesByUID(games: Game[], uid: string): Game[] {
  return sortGamesByTimestamp(games.filter((g) => g.players.includes(uid)));
}

export function sortGamesByTimestamp(games: Game[]): Game[] {
  return [...games].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getRecentGames(games: Game[], n: number): Game[] {
  return [...games]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, n);
}
