import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Activity, RefreshCw } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { getGames } from '../../api/games';
import { QUERY_KEYS } from '../../lib/queryKeys';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import HeroStats from './HeroStats';
import LeaderboardPreview from './LeaderboardPreview';
import RecentGamesFeed from './RecentGamesFeed';

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
    <span>{message}</span>
    <button
      onClick={onRetry}
      aria-label="Retry"
      className="flex items-center gap-1 font-semibold hover:underline"
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry
    </button>
  </div>
);

const DashboardPage: React.FC = () => {
  const {
    data: players = [],
    isLoading: playersLoading,
    isError: playersError,
    refetch: refetchPlayers,
  } = useQuery({ queryKey: QUERY_KEYS.players, queryFn: getPlayers });

  const {
    data: games = [],
    isLoading: gamesLoading,
    isError: gamesError,
    refetch: refetchGames,
  } = useQuery({ queryKey: QUERY_KEYS.games, queryFn: getGames });

  return (
    <div className="py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your pickleball stats at a glance
        </p>
      </div>

      {/* Hero Stats */}
      <section aria-label="Key stats">
        {playersLoading || gamesLoading ? (
          <SkeletonLoader variant="stat" count={3} />
        ) : playersError ? (
          <ErrorBanner message="Failed to load player stats." onRetry={refetchPlayers} />
        ) : (
          <HeroStats players={players} games={games} />
        )}
      </section>

      {/* Leaderboard Preview */}
      <section aria-label="Top players">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Top Players
        </h2>
        {playersLoading ? (
          <SkeletonLoader variant="list-item" count={5} />
        ) : playersError ? (
          <ErrorBanner message="Failed to load leaderboard." onRetry={refetchPlayers} />
        ) : players.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No players yet"
            description="Players will appear here once registered."
          />
        ) : (
          <LeaderboardPreview players={players} />
        )}
      </section>

      {/* Recent Games */}
      <section aria-label="Recent games">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Recent Games
        </h2>
        {gamesLoading ? (
          <SkeletonLoader variant="card" count={5} />
        ) : gamesError ? (
          <ErrorBanner message="Failed to load recent games." onRetry={refetchGames} />
        ) : games.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No games yet"
            description="Log your first match to see it here!"
          />
        ) : (
          <RecentGamesFeed games={games} />
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
