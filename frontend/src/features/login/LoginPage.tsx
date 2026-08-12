import React, { useState } from 'react';
import { LogIn, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import { loginWithCredentials } from '../../api/auth';

const LoginPage: React.FC = () => {
  const { login } = useSessionStore();
  const { addToast } = useToastStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setIsLoading(true);
      const token = await loginWithCredentials(username, password);
      // mark session as admin
      // for admin, display "Admin" or their username as displayName
      login(token, true, '', 'Admin', username);
      addToast(`Welcome, ${username}!`, 'success');
      // Redirect will be handled by the app routing
      window.location.href = '/admin/players';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Admin Login</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to manage players</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-lg hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          {/* Demo Credentials */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-semibold">Demo credentials:</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Username: <span className="font-mono">hari</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Password: <span className="font-mono">hari</span>
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
          JWT-based authentication for secure admin access
        </p>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-3">
          Not an admin?{' '}
          <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Register as a player
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

