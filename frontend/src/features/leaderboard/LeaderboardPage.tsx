import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, SearchX, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { sortPlayers, filterPlayersByName } from '../../lib/playerUtils';
import type { SortKey } from '../../types';
import PlayerCard from '../../components/cards/PlayerCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rankScore');

  const { data: players = [], isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: getPlayers,
  });

  const displayList = sortPlayers(filterPlayersByName(players, searchQuery), sortKey);

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {players.length} players ranked
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            aria-label="Search players by name"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort players by"
            className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm appearance-none focus:border-brand-400 dark:focus:border-brand-600 transition-colors"
          >
            <option value="rankScore">Rank Score</option>
            <option value="winRate">Win Rate</option>
            <option value="gamesPlayed">Games Played</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <SkeletonLoader variant="list-item" count={8} />
      ) : isError ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <span>Failed to load players.</span>
          <button onClick={() => refetch()} className="flex items-center gap-1 font-semibold hover:underline">
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Retry
          </button>
        </div>
      ) : displayList.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No players found"
          description="No players match your search query."
        />
      ) : (
        <div className="space-y-2">
          {displayList.map((player, index) => (
            <PlayerCard
              key={player._id}
              player={player}
              rank={index + 1}
              onClick={() => navigate(`/players/${player.uid}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
