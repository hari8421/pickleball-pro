import type { Team } from '../types';
import { useSessionStore } from '../store/sessionStore';

function getAuthHeader(): Record<string, string> {
  const token = useSessionStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.error || body.message || fallback);
}

export async function getTeams(): Promise<Team[]> {
  const res = await fetch('/api/teams');
  if (!res.ok) throw await parseError(res, `Failed to load teams: ${res.statusText}`);
  const body = await res.json();
  return body.data;
}

export async function createTeam(payload: Pick<Team, 'name' | 'description' | 'color' | 'members'>): Promise<Team> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res, `Failed to create team: ${res.statusText}`);
  return res.json();
}

export async function updateTeam(id: string, payload: Partial<Pick<Team, 'name' | 'description' | 'color' | 'members'>>): Promise<Team> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res, `Failed to update team: ${res.statusText}`);
  return res.json();
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw await parseError(res, `Failed to delete team: ${res.statusText}`);
}
