import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subtitle }) => (
  <div className="glass rounded-2xl p-5 flex flex-col gap-3 bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-200/30 dark:border-brand-800/30">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</span>
      <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  </div>
);

export default StatCard;
