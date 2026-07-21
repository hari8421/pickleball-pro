export async function loginWithCredentials(username: string, password: string): Promise<string> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Login failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.token;
}

export async function verifyToken(token: string): Promise<{ id: string; username: string }> {
  const res = await fetch('/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Token verification failed');
  }

  const data = await res.json();
  return data.admin;
}

