import type { Game } from '../types';
import { useSessionStore } from '../store/sessionStore';

function getAuthHeader(): Record<string, string> {
  const token = useSessionStore.getState().token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {} as Record<string, string>;
}

export async function getGames(): Promise<Game[]> {
  const res = await fetch('/api/games', { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error(`Failed to fetch games: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function createGame(
  payload: Omit<Game, '_id' | 'createdAt'>
): Promise<Game> {
  const res = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json();
}
