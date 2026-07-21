import React from 'react';
import type { Game } from '../../types';
import { formatDateTime } from '../../lib/formatters';
import { Users, Clock } from 'lucide-react';

interface GameHistoryListProps {
  games: Game[];
  uid: string;
}

const GameHistoryList: React.FC<GameHistoryListProps> = ({ games, uid }) => (
  <div className="space-y-3">
    {games.map((game) => {
      const otherPlayers = game.players.filter((p) => p !== uid);
      return (
        <div
          key={game._id}
          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
        >
          {/* Score pill */}
          <div className="flex-shrink-0 text-center bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Score</p>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {game.score.homeTeam} – {game.score.awayTeam}
            </p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{formatDateTime(game.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{otherPlayers.length} other player{otherPlayers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default GameHistoryList;
