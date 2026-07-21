import React, { useState } from 'react';
import { UserPlus, AlertCircle, Loader } from 'lucide-react';
import { registerUser, loginUser } from '../../api/users';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';

const RegisterPage: React.FC = () => {
  const { login } = useSessionStore();
  const { addToast } = useToastStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [playingLevel, setPlayingLevel] = useState<'beginner'|'intermediate'|'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password || !displayName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await registerUser({ username, password, displayName, playingLevel });

      // Auto-login after registration
      const data = await loginUser(username, password);
      const token = data.token;
      login(token, false, username, displayName, username);

      addToast({ id: Date.now().toString(), message: 'Registration successful', type: 'success' });
      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      addToast({ id: Date.now().toString(), message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-slate-600">Register to join the community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow space-y-4">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Playing level</label>
            <select value={playingLevel} onChange={(e) => setPlayingLevel(e.target.value as any)} className="w-full px-3 py-2 rounded border">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 bg-brand-600 text-white rounded">
              {isLoading ? (<><Loader className="w-4 h-4 animate-spin inline-block mr-2"/>Creating...</>) : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

