import type { Player, SortKey } from '../types';

export function sortPlayers(players: Player[], key: SortKey): Player[] {
  return [...players].sort((a, b) => b[key] - a[key]);
}

export function filterPlayersByName(players: Player[], query: string): Player[] {
  if (!query.trim()) return players;
  const lower = query.toLowerCase();
  return players.filter((p) => p.displayName.toLowerCase().includes(lower));
}
