import React from 'react';
import { Users, Gamepad2, Trophy } from 'lucide-react';
import type { Player, Game } from '../../types';
import StatCard from '../../components/cards/StatCard';
import { sortPlayers } from '../../lib/playerUtils';

interface HeroStatsProps {
  players: Player[];
  games: Game[];
}

const HeroStats: React.FC<HeroStatsProps> = ({ players, games }) => {
  const sorted = sortPlayers(players, 'rankScore');
  const topPlayer = sorted[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        title="Total Players"
        value={players.length}
        icon={Users}
        subtitle="Registered players"
      />
      <StatCard
        title="Games Played"
        value={games.length}
        icon={Gamepad2}
        subtitle="All-time matches"
      />
      <StatCard
        title="Top Player"
        value={topPlayer?.rankScore ?? '—'}
        icon={Trophy}
        subtitle={topPlayer?.displayName ?? 'No players yet'}
      />
    </div>
  );
};

export default HeroStats;
