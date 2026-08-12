import { useSessionStore } from '../store/sessionStore';

function getAuthHeader(): Record<string, string> {
  const token = useSessionStore.getState().token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {} as Record<string, string>;
}

export async function getFriendRequests(uid?: string) {
  const url = uid ? `/api/friends?uid=${encodeURIComponent(uid)}` : '/api/friends';
  const res = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch friend requests: ${res.statusText}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createFriendRequest(senderUID: string, receiverUID: string) {
  const res = await fetch('/api/friends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ senderUID, receiverUID }),
  });

  if (res.status === 409) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'A friend request between these users already exists');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create friend request: ${res.statusText}`);
  }

  return res.json();
}

export async function updateFriendRequest(id: string, status: 'accepted' | 'pending') {
  const res = await fetch(`/api/friends/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update friend request: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteFriendRequest(id: string) {
  const res = await fetch(`/api/friends/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (res.status === 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Friend request not found');
  }
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete friend request: ${res.statusText}`);
  }
}

