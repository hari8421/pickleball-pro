import { useSessionStore } from '../store/sessionStore';
import type { User } from '../types';

export interface UserSession {
  token: string;
  user: User;
}

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body.error || body.message || body.errors?.[0]?.msg || fallback;
}

async function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }
}

export async function registerUser(payload: {
  username: string;
  password: string;
  displayName: string;
  playingLevel?: User['playingLevel'];
}): Promise<User> {
  const res = await request('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, username: payload.username.trim(), displayName: payload.displayName.trim() }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, 'Registration failed.'));
  return res.json();
}

export async function loginUser(username: string, password: string): Promise<UserSession> {
  const res = await request('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, 'Invalid username or password.'));
  const data = await res.json().catch(() => null);
  if (!data?.token || !data?.user) throw new Error('The server returned an invalid login response.');
  return data;
}

export async function getPublicUsers(): Promise<User[]> {
  const res = await request('/api/users');
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to load players.'));
  const data = await res.json();
  return data.data;
}

export async function getUserByUsername(username: string): Promise<User> {
  const res = await request(`/api/users/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to load player profile.'));
  return res.json();
}

function getAuthHeader(): Record<string, string> {
  const token = useSessionStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCurrentUser(): Promise<User> {
  const res = await request('/api/users/me', { headers: getAuthHeader() });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Your session is no longer valid.'));
  return res.json();
}

export async function updateCurrentUser(updates: { displayName?: string; playingLevel?: User['playingLevel'] }): Promise<User> {
  const res = await request('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ ...updates, displayName: updates.displayName?.trim() }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to update your profile.'));
  return res.json();
}
