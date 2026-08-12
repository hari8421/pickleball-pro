import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Gamepad2, Users, PlusCircle, ShieldCheck, User, LogOut } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useToastStore } from '../../store/toastStore';
import { useNavigate } from 'react-router-dom';
import AvatarInitials from '../common/AvatarInitials';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, exact: false },
  { to: '/games', label: 'Games', icon: Gamepad2, exact: false },
  { to: '/users', label: 'Players', icon: Users, exact: false },
  { to: '/friends', label: 'Friends', icon: Users, exact: false },
  { to: '/add-game', label: 'Add Game', icon: PlusCircle, exact: false },
];

const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isAdmin, token, displayName, logout } = useSessionStore();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const authTabs = token ? [{ to: '/profile/me', label: 'Profile', icon: User, exact: false }] : [];
  const visibleTabs = isAdmin ? [...tabs, ...authTabs, { to: '/admin/players', label: 'Admin', icon: ShieldCheck, exact: false }] : [...tabs, ...authTabs];

  return (
  <nav
    aria-label="Main navigation"
    className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50 pb-safe flex items-center justify-between px-4"
  >
    <div className="flex items-center justify-around flex-1">
      {visibleTabs.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          aria-label={label}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-3 px-3 min-w-0 flex-1 transition-colors ${
              isActive
                ? 'text-brand-500'
                : 'text-slate-400 dark:text-slate-500 hover:text-brand-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className="w-5 h-5 flex-shrink-0"
                strokeWidth={isActive ? 2.5 : 1.5}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium truncate leading-tight">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>

    {/* Profile info and logout button */}
    {token && displayName ? (
      <div className="flex items-center gap-2 ml-2">
        <NavLink to="/profile/me" title={displayName} className="flex items-center justify-center hover:text-brand-500 transition-colors">
          <AvatarInitials name={displayName} size="sm" />
        </NavLink>
        <button onClick={handleLogout} title="Logout" className="p-1 hover:text-red-500 transition-colors text-slate-400">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    ) : null}
  </nav>
);
};

export default BottomTabBar;
