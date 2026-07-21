import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player } from '../../types';
import PlayerCard from '../../components/cards/PlayerCard';
import { sortPlayers } from '../../lib/playerUtils';

interface LeaderboardPreviewProps {
  players: Player[];
}

const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({ players }) => {
  const navigate = useNavigate();
  const top5 = sortPlayers(players, 'rankScore').slice(0, 5);

  return (
    <div className="space-y-2">
      {top5.map((player, index) => (
        <PlayerCard
          key={player._id}
          player={player}
          rank={index + 1}
          onClick={() => navigate(`/players/${player.uid}`)}
        />
      ))}
    </div>
  );
};

export default LeaderboardPreview;
