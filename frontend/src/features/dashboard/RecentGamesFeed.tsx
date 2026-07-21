import React from 'react';
import type { Game } from '../../types';
import GameCard from '../../components/cards/GameCard';
import { getRecentGames } from '../../lib/gameUtils';

interface RecentGamesFeedProps {
  games: Game[];
}

const RecentGamesFeed: React.FC<RecentGamesFeedProps> = ({ games }) => {
  const recent = getRecentGames(games, 5);

  return (
    <div className="space-y-3">
      {recent.map((game) => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
};

export default RecentGamesFeed;
