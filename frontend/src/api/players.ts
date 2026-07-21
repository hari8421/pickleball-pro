import type { Player } from '../types';

export async function getPlayers(): Promise<Player[]> {
  const res = await fetch('/api/players');
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}
