import React, { useState } from 'react';
import { AlertCircle, LogIn, Loader, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithCredentials } from '../../api/auth';
import { loginUser } from '../../api/users';
import { getSafeReturnTo, validateLoginFields } from '../../lib/authValidation';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';

type LoginMode = 'player' | 'admin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const loginSession = useSessionStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const [mode, setMode] = useState<LoginMode>('player');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAdminMode = mode === 'admin';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateLoginFields(username, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      if (isAdminMode) {
        const token = await loginWithCredentials(username, password);
        loginSession(token, true, '', 'Admin', username.trim());
      } else {
        const session = await loginUser(username, password);
        loginSession(session.token, false, session.user.username, session.user.displayName, session.user.username);
      }

      addToast(`Welcome back, ${username.trim()}!`, 'success');
      navigate(returnTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      setErrors({ form: message });
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4">
            {isAdminMode ? <ShieldCheck className="w-8 h-8 text-white" aria-hidden="true" /> : <LogIn className="w-8 h-8 text-white" aria-hidden="true" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your Pickleball account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900" role="tablist" aria-label="Account type">
            <button type="button" role="tab" aria-selected={!isAdminMode} onClick={() => switchMode('player')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${!isAdminMode ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              <UserRound className="w-4 h-4" aria-hidden="true" /> Player
            </button>
            <button type="button" role="tab" aria-selected={isAdminMode} onClick={() => switchMode('admin')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isAdminMode ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Admin
            </button>
          </div>

          {errors.form && (
            <div role="alert" className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}

          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
            <input id="login-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username" autoComplete="username" disabled={isLoading} aria-invalid={!!errors.username} aria-describedby={errors.username ? 'login-username-error' : undefined} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 transition-all" />
            {errors.username && <p id="login-username-error" role="alert" className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete={isAdminMode ? 'current-password' : 'current-password'} disabled={isLoading} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'login-password-error' : undefined} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 transition-all" />
            {errors.password && <p id="login-password-error" role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {isLoading ? <><Loader className="w-4 h-4 animate-spin" aria-hidden="true" /> Signing in...</> : <><LogIn className="w-4 h-4" aria-hidden="true" /> Sign in</>}
          </button>

          {isAdminMode && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold mb-1">Demo admin</p>
              <p>Username: <span className="font-mono">hari</span> · Password: <span className="font-mono">hari</span></p>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Need an account?{' '}
          <Link to={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="text-brand-600 dark:text-brand-400 hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
