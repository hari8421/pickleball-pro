import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Activity, Trophy, Gamepad2 } from 'lucide-react';
import { getPlayers } from '../../api/players';
import { getGames } from '../../api/games';
import { QUERY_KEYS } from '../../lib/queryKeys';
import { filterGamesByUID } from '../../lib/gameUtils';
import { formatWinRate } from '../../lib/formatters';
import Avatar from '../../components/common/Avatar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import StatCard from '../../components/cards/StatCard';
import EmptyState from '../../components/common/EmptyState';
import GameHistoryList from './GameHistoryList';

const PlayerProfilePage: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: getPlayers,
  });

  const { data: games = [], isLoading: loadingGames } = useQuery({
    queryKey: QUERY_KEYS.games,
    queryFn: getGames,
  });

  const isLoading = loadingPlayers || loadingGames;
  const player = players.find((p) => p.uid === uid);
  const playerGames = player ? filterGamesByUID(games, player.uid) : [];

  return (
    <div className="py-6 space-y-6">
      {/* Back link */}
      <Link
        to="/leaderboard"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
        aria-label="Back to leaderboard"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Leaderboard
      </Link>

      {isLoading ? (
        <SkeletonLoader variant="profile" />
      ) : !player ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Player not found
          </p>
          <Link
            to="/leaderboard"
            className="text-sm text-brand-500 hover:underline font-medium"
          >
            Go to Leaderboard
          </Link>
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar src={player.avatarURL} name={player.displayName} size="lg" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {player.displayName}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                UID: {player.uid}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard title="Rank Score" value={player.rankScore} icon={Trophy} />
            <StatCard
              title="Win Rate"
              value={formatWinRate(player.winRate)}
              icon={Activity}
            />
            <StatCard title="Games" value={player.gamesPlayed} icon={Gamepad2} />
          </div>

          {/* Game history */}
          <section aria-label="Game history">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Game History ({playerGames.length})
            </h2>
            {playerGames.length === 0 ? (
              <EmptyState
                icon={Gamepad2}
                title="No games yet"
                description="This player hasn't logged any games."
              />
            ) : (
              <GameHistoryList games={playerGames} uid={player.uid} />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default PlayerProfilePage;
