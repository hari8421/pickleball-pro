import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Gamepad2, Users, PlusCircle } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, exact: false },
  { to: '/games', label: 'Games', icon: Gamepad2, exact: false },
  { to: '/friends', label: 'Friends', icon: Users, exact: false },
  { to: '/add-game', label: 'Add Game', icon: PlusCircle, exact: false },
];

const BottomTabBar: React.FC = () => (
  <nav
    aria-label="Main navigation"
    className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/50 pb-safe"
  >
    <div className="flex items-center justify-around">
      {tabs.map(({ to, label, icon: Icon, exact }) => (
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
  </nav>
);

export default BottomTabBar;
