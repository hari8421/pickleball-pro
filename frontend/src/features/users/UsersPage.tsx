import React, { useEffect, useState } from 'react';
import { getPublicUsers } from '../../api/users';
import type { User } from '../../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getPublicUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Players</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.username} className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{u.displayName}</p>
                    <p className="text-sm text-slate-500">{u.playingLevel}</p>
                  </div>
                  <div className="text-sm text-slate-400">@{u.username}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersPage;

