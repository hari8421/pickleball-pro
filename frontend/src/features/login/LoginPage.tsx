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
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 dark:border-slate-700/80 bg-slate-900 shadow-2xl mb-6">
          <svg viewBox="0 0 640 280" className="block w-full" role="img" aria-label="A pickleball resting over a sunny green court">
            <defs>
              <linearGradient id="courtSky" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f766e" />
                <stop offset="55%" stopColor="#166534" />
                <stop offset="100%" stopColor="#052e16" />
              </linearGradient>
              <linearGradient id="courtSurface" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <radialGradient id="ballGlow" cx="35%" cy="25%" r="75%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>
            </defs>
            <rect width="640" height="280" fill="url(#courtSky)" />
            <circle cx="540" cy="54" r="28" fill="#fef08a" opacity="0.9" />
            <path d="M0 172 C150 135 260 156 388 132 C500 112 570 126 640 104 V280 H0Z" fill="url(#courtSurface)" />
            <path d="M0 172 C150 135 260 156 388 132 C500 112 570 126 640 104" fill="none" stroke="#bbf7d0" strokeWidth="3" opacity="0.7" />
            <path d="M42 252 L162 153 M598 252 L478 125 M118 280 L226 150 M522 280 L414 133" fill="none" stroke="#dcfce7" strokeWidth="3" opacity="0.8" />
            <path d="M62 232 H578 M146 178 H494" fill="none" stroke="#dcfce7" strokeWidth="3" opacity="0.8" />
            <path d="M320 130 V280" stroke="#ecfdf5" strokeWidth="5" opacity="0.9" />
            <path d="M318 126 C318 118 322 114 328 114 H336 C342 114 346 118 346 126 V216" fill="none" stroke="#f8fafc" strokeWidth="3" opacity="0.75" />
            <path d="M286 218 H354" stroke="#f8fafc" strokeWidth="4" opacity="0.8" />
            <g transform="translate(415 112) rotate(18)">
              <circle cx="0" cy="0" r="48" fill="#713f12" opacity="0.25" transform="translate(7 10)" />
              <circle cx="0" cy="0" r="48" fill="url(#ballGlow)" stroke="#fef3c7" strokeWidth="4" />
              <circle cx="-17" cy="-16" r="5" fill="#a16207" opacity="0.85" />
              <circle cx="12" cy="-22" r="5" fill="#a16207" opacity="0.85" />
              <circle cx="25" cy="4" r="5" fill="#a16207" opacity="0.85" />
              <circle cx="-7" cy="17" r="5" fill="#a16207" opacity="0.85" />
              <circle cx="-27" cy="10" r="5" fill="#a16207" opacity="0.85" />
            </g>
            <path d="M420 72 C448 50 472 46 500 52" fill="none" stroke="#ecfccb" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          </svg>
          <div className="absolute left-5 bottom-4 flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm text-lg">●</span>
            <span className="text-sm font-semibold tracking-wide">Pickleball Pro <span className="text-brand-200 font-normal">· Find your rally</span></span>
          </div>
        </div>

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
