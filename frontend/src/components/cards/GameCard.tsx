import React from 'react';
import { MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import type { Game } from '../../types';
import { formatDateTime } from '../../lib/formatters';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [lon, lat] = game.location.coordinates;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-4 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all">
      {/* Score */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Home</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{game.score.homeTeam}</p>
        </div>
        <div className="text-slate-300 dark:text-slate-600 font-light text-xl">vs</div>
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Away</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{game.score.awayTeam}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          {game.players.length} players
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          {formatDateTime(game.timestamp)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          {lat.toFixed(3)}, {lon.toFixed(3)}
        </span>
      </div>

      {/* Media link */}
      {game.mediaURL && (
        <a
          href={game.mediaURL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
          aria-label="View game media"
        >
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          View Media
        </a>
      )}
    </div>
  );
};

export default GameCard;
