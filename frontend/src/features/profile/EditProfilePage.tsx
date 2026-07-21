import React, { useEffect, useState } from 'react';
import { useToastStore } from '../../store/toastStore';
import { getCurrentUser, updateCurrentUser } from '../../api/users';
import { useSessionStore } from '../../store/sessionStore';

const EditProfilePage: React.FC = () => {
  const { addToast } = useToastStore();
  const { currentUID } = useSessionStore();
  const [displayName, setDisplayName] = useState('');
  const [playingLevel, setPlayingLevel] = useState<'beginner'|'intermediate'|'advanced'>('intermediate');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setDisplayName(data.displayName || '');
      setPlayingLevel(data.playingLevel || 'intermediate');
    } catch (err) {
      addToast({ id: Date.now().toString(), message: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateCurrentUser({ displayName, playingLevel });
      addToast({ id: Date.now().toString(), message: 'Profile updated', type: 'success' });
      // Optionally update session store currentUID if username changed - username isn't editable
    } catch (err) {
      addToast({ id: Date.now().toString(), message: err instanceof Error ? err.message : 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-6 rounded-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Playing level</label>
            <select value={playingLevel} onChange={(e) => setPlayingLevel(e.target.value as any)} className="w-full px-3 py-2 rounded border">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded">{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;

