import React from 'react';

interface SkeletonLoaderProps {
  variant: 'card' | 'list-item' | 'profile' | 'stat';
  count?: number;
}

const StatSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 h-28 w-full" />
);

const ListItemSkeleton = () => (
  <div className="animate-pulse flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
    <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2" />
    </div>
    <div className="w-16 h-6 bg-slate-300 dark:bg-slate-700 rounded-full" />
  </div>
);

const CardSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50 p-4 space-y-3">
    <div className="h-5 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
    <div className="h-8 bg-slate-200 dark:bg-slate-600 rounded w-full" />
    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
  </div>
);

const ProfileSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-700" />
      <div className="space-y-2 flex-1">
        <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-1/3" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      ))}
    </div>
  </div>
);

const variantMap: Record<SkeletonLoaderProps['variant'], React.FC> = {
  stat: StatSkeleton,
  'list-item': ListItemSkeleton,
  card: CardSkeleton,
  profile: ProfileSkeleton,
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1 }) => {
  const Component = variantMap[variant];
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
