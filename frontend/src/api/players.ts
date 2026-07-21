import type { Player } from '../types';
import { useSessionStore } from '../store/sessionStore';

function getAuthHeader() {
  const token = useSessionStore.getState().token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function getPlayers(): Promise<Player[]> {
  const res = await fetch('/api/players');
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function getPlayerByUID(uid: string): Promise<Player> {
  const res = await fetch(`/api/players/${uid}`);
  if (!res.ok) throw new Error(`Failed to fetch player: ${res.statusText}`);
  return res.json();
}

export async function createPlayer(
  player: Omit<Player, '_id' | 'createdAt'>,
  adminUIDAlt?: string
): Promise<Player> {
  const authHeader = getAuthHeader();
  const body = { ...player };
  // Add adminUID to body only if JWT token is not available and adminUID provided
  if (!authHeader.Authorization && adminUIDAlt) {
    (body as any).adminUID = adminUIDAlt;
  }

  const res = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to create player: ${res.statusText}`);
  }
  return res.json();
}

export async function updatePlayer(
  uid: string,
  updates: Partial<Omit<Player, '_id' | 'createdAt'>>,
  adminUIDAlt?: string
): Promise<Player> {
  const authHeader = getAuthHeader();
  const body = { ...updates };
  // Add adminUID to body only if JWT token is not available and adminUID provided
  if (!authHeader.Authorization && adminUIDAlt) {
    (body as any).adminUID = adminUIDAlt;
  }

  const res = await fetch(`/api/players/${uid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to update player: ${res.statusText}`);
  }
  return res.json();
}

export async function deletePlayer(uid: string, adminUIDAlt?: string): Promise<void> {
  const authHeader = getAuthHeader();
  const url = new URL(`/api/players/${uid}`, window.location.origin);

  // Add adminUID to query only if JWT token is not available and adminUID provided
  if (!authHeader.Authorization && adminUIDAlt) {
    url.searchParams.set('adminUID', adminUIDAlt);
  }

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: authHeader,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to delete player: ${res.statusText}`);
  }
}

