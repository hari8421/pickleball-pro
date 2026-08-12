import React, { useState } from 'react';
import { AlertCircle, Loader, UserPlus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, registerUser } from '../../api/users';
import { getSafeReturnTo, validateRegistrationFields } from '../../lib/authValidation';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import type { User } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
  const loginSession = useSessionStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [playingLevel, setPlayingLevel] = useState<User['playingLevel']>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validateRegistrationFields(username, displayName, password, confirmPassword);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    let accountCreated = false;
    try {
      await registerUser({ username, password, displayName, playingLevel });
      accountCreated = true;
      const session = await loginUser(username, password);
      loginSession(session.token, false, session.user.username, session.user.displayName, session.user.username);
      addToast('Your account is ready. Welcome to Pickleball!', 'success');
      navigate(returnTo, { replace: true });
    } catch (error) {
      const message = accountCreated
        ? 'Your account was created, but automatic sign-in failed. Please sign in manually.'
        : error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';
      setErrors({ form: message });
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4">
            <UserPlus className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Join the pickleball community</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          {errors.form && (
            <div role="alert" className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}

          <div>
            <label htmlFor="register-username" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Username</label>
            <input id="register-username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required disabled={isLoading} aria-invalid={!!errors.username} aria-describedby={errors.username ? 'register-username-error' : undefined} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">3–32 letters, numbers, dots, dashes, or underscores.</p>
            {errors.username && <p id="register-username-error" role="alert" className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="register-display-name" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Display name</label>
            <input id="register-display-name" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" required disabled={isLoading} aria-invalid={!!errors.displayName} aria-describedby={errors.displayName ? 'register-display-name-error' : undefined} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            {errors.displayName && <p id="register-display-name-error" role="alert" className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Password</label>
            <input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required disabled={isLoading} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'register-password-error' : undefined} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">At least 6 characters.</p>
            {errors.password && <p id="register-password-error" role="alert" className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Confirm password</label>
            <input id="register-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required disabled={isLoading} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            {errors.confirmPassword && <p id="register-confirm-password-error" role="alert" className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="register-level" className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Playing level</label>
            <select id="register-level" value={playingLevel} onChange={(event) => setPlayingLevel(event.target.value as User['playingLevel'])} disabled={isLoading} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <><Loader className="w-4 h-4 animate-spin" aria-hidden="true" /> Creating account...</> : <><UserPlus className="w-4 h-4" aria-hidden="true" /> Create account</>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-brand-600 dark:text-brand-400 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
