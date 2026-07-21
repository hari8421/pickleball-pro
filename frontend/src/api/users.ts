import type { Player } from '../types';
import type { User } from '../types';

export async function registerUser(payload: { username: string; password: string; displayName: string; playingLevel?: string }) {
  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Registration failed: ${res.statusText}`);
  }

  return res.json();
}

export async function loginUser(username: string, password: string) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Login failed: ${res.statusText}`);
  }

  return res.json();
}

export async function getPublicUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function getUserByUsername(username: string) {
  const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);
  return res.json();
}

function getAuthHeader() {
  const token = (globalThis as any).localStorage?.getItem('token');
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export async function getCurrentUser() {
  const res = await fetch('/api/users/me', { headers: { ...getAuthHeader() } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch current user: ${res.statusText}`);
  }
  return res.json();
}

export async function updateCurrentUser(updates: { displayName?: string; playingLevel?: string }) {
  const res = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update user: ${res.statusText}`);
  }
  return res.json();
}

