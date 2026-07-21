import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Gamepad2, Users, PlusCircle, Pickaxe, ShieldCheck, User, LogOut } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import { useNavigate } from 'react-router-dom';
import AvatarInitials from '../common/AvatarInitials';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isAdmin, token, displayName, logout } = useSessionStore();

  const handleLogout = () => {
    logout();
    addToast({ id: Date.now().toString(), message: 'Logged out successfully', type: 'success' });
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, exact: false },
    { to: '/games', label: 'Games', icon: Gamepad2, exact: false },
    { to: '/users', label: 'Players', icon: Users, exact: false },
    { to: '/friends', label: 'Friends', icon: Users, exact: false },
    { to: '/add-game', label: 'Add Game', icon: PlusCircle, exact: false },
    ...(isAdmin ? [{ to: '/admin/players', label: 'Admin', icon: ShieldCheck, exact: false }] : []),
  ];

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 h-16 items-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
          <Pickaxe className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="font-bold text-slate-800 dark:text-white text-lg">Pickleball</span>
      </div>

      {/* Nav links */}
      <nav aria-label="Main navigation" className="flex items-center gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User profile section (if authenticated) */}
      {token && displayName ? (
        <div className="flex items-center gap-3 ml-auto">
          <NavLink
            to="/profile/me"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <AvatarInitials name={displayName} size="sm" />
            <span className="hidden sm:inline">Hi, {displayName}</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      <ThemeToggle />
    </header>
  );
};

export default NavBar;
