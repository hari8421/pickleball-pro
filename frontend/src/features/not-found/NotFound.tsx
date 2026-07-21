import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
      <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-400" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold text-slate-800 dark:text-white">404</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">Page not found</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
