import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Activity, RefreshCw, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getGames } from '../../api/games';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { sortGamesByTimestamp } from '../../lib/gameUtils';
import GameCard from '../../components/cards/GameCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import type { Game } from '../../types';

const SwipeableGameCard: React.FC<{ game: Game }> = ({ game }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    drag="x"
    dragConstraints={{ left: -80, right: 0 }}
    dragElastic={0.1}
    className="relative"
  >
    {/* Swipe action reveal */}
    <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-brand-100 dark:bg-brand-900/40 rounded-r-2xl text-xs text-brand-600 dark:text-brand-400 font-medium pointer-events-none select-none">
      Details
    </div>
    <GameCard game={game} />
  </motion.div>
);

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: games = [], isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.games,
    queryFn: getGames,
  });

  const sorted = sortGamesByTimestamp(games);

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Games</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {games.length} matches logged
        </p>
      </div>

      {isLoading ? (
        <SkeletonLoader variant="card" count={5} />
      ) : isError ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <span>Failed to load games.</span>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 font-semibold hover:underline"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No games logged yet"
          description="Be the first to log a pickleball match!"
          action={
            <button
              onClick={() => navigate('/add-game')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              Log a Game
            </button>
          }
        />
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {sorted.map((game) => (
            <SwipeableGameCard key={game._id} game={game} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default GamesPage;
