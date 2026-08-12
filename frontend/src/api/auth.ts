export interface AdminSession {
  id: string;
  username: string;
}

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body.error || body.message || body.errors?.[0]?.msg || fallback;
}

export async function loginWithCredentials(username: string, password: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
  } catch {
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Invalid admin credentials.'));
  }

  const data = await res.json().catch(() => null);
  if (!data?.token) throw new Error('The server returned an invalid login response.');
  return data.token;
}

export async function verifyToken(token: string): Promise<AdminSession> {
  let res: Response;
  try {
    res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('Unable to verify your session.');
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Your admin session is no longer valid.'));
  }

  const data = await res.json().catch(() => null);
  if (!data?.admin?.username) throw new Error('The server returned an invalid session response.');
  return {
    id: String(data.admin.id || data.admin._id || ''),
    username: data.admin.username,
  };
}
