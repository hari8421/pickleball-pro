import React from 'react';
import { Trophy } from 'lucide-react';
import type { Player } from '../../types';
import Avatar from '../common/Avatar';
import { formatWinRate } from '../../lib/formatters';

interface PlayerCardProps {
  player: Player;
  rank: number;
  onClick?: () => void;
}

const rankColors: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-slate-300 text-slate-700',
  3: 'bg-amber-600 text-white',
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, rank, onClick }) => {
  const rankStyle = rankColors[rank] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-label={`${player.displayName}, rank ${rank}, score ${player.rankScore}`}
      className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Rank badge */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankStyle}`}
        aria-hidden="true"
      >
        {rank <= 3 ? <Trophy className="w-3.5 h-3.5" /> : rank}
      </div>

      {/* Avatar */}
      <Avatar src={player.avatarURL} name={player.displayName} size="md" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {player.displayName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {player.gamesPlayed} games
        </p>
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-slate-900 dark:text-white">{player.rankScore}</p>
        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
          {formatWinRate(player.winRate)} WR
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;
