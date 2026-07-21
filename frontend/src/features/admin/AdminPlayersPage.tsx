import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Player } from '../../types';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../api/players';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import { useAuth } from '../../hooks/useAuth';
import AdminPlayerForm from './AdminPlayerForm';

const AdminPlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { isAdmin, logout, currentUID } = useSessionStore();
  const { addToast } = useToastStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchPlayers();
    }
  }, [isAuthenticated, navigate]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await getPlayers();
      setPlayers(data);
    } catch (err) {
      addToast({
        id: Date.now().toString(),
        message: 'Failed to load players',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: Omit<Player, '_id' | 'createdAt'>) => {
    try {
      await createPlayer(formData, currentUID);
      addToast({
        id: Date.now().toString(),
        message: 'Player created successfully',
        type: 'success',
      });
      setShowForm(false);
      await fetchPlayers();
    } catch (err) {
      addToast({
        id: Date.now().toString(),
        message: err instanceof Error ? err.message : 'Failed to create player',
        type: 'error',
      });
    }
  };

  const handleUpdate = async (player: Player, formData: Partial<Omit<Player, '_id' | 'createdAt'>>) => {
    try {
      await updatePlayer(player.uid, formData, currentUID);
      addToast({
        id: Date.now().toString(),
        message: 'Player updated successfully',
        type: 'success',
      });
      setEditingPlayer(null);
      await fetchPlayers();
    } catch (err) {
      addToast({
        id: Date.now().toString(),
        message: err instanceof Error ? err.message : 'Failed to update player',
        type: 'error',
      });
    }
  };

  const handleDelete = async (uid: string, displayName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${displayName}?`)) {
      return;
    }

    try {
      await deletePlayer(uid, currentUID);
      addToast({
        id: Date.now().toString(),
        message: 'Player deleted successfully',
        type: 'success',
      });
      await fetchPlayers();
    } catch (err) {
      addToast({
        id: Date.now().toString(),
        message: err instanceof Error ? err.message : 'Failed to delete player',
        type: 'error',
      });
    }
  };

  const handleLogout = () => {
    logout();
    addToast({
      id: Date.now().toString(),
      message: 'Logged out successfully',
      type: 'success',
    });
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Loading...</h1>
          <p className="text-slate-600 dark:text-slate-400">Verifying authentication</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400">Only admin players can access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingPlayer(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Player
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create New Player</h2>
            <AdminPlayerForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Edit Form */}
        {editingPlayer && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Player</h2>
            <AdminPlayerForm
              initialData={editingPlayer}
              onSubmit={(formData) => handleUpdate(editingPlayer, formData)}
              onCancel={() => setEditingPlayer(null)}
            />
          </div>
        )}

        {/* Players List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">UID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Rank Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Games</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Win Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Admin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-slate-500">Loading players...</td>
                  </tr>
                ) : players.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-slate-500">No players found</td>
                  </tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200 font-medium">{player.displayName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{player.uid}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200">{player.rankScore}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200">{player.gamesPlayed}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-200">{(player.winRate * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          player.isAdmin
                            ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {player.isAdmin ? '✓ Admin' : 'Player'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex items-center gap-2">
                        <button
                          onClick={() => setEditingPlayer(player)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit player"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.uid, player.displayName)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayersPage;

