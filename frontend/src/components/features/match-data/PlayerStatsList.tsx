import React from 'react';
import type { PlayerStat, PositionType } from '@/types/matchData';
import PlayerStatsRow from './PlayerStatsRow';

interface PlayerStatsListProps {
  bluePlayers: PlayerStat[];
  redPlayers: PlayerStat[];
  expandedPosition: string | null;
  onToggle: (position: string) => void;
}

const POSITION_ORDER: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const PlayerStatsList: React.FC<PlayerStatsListProps> = ({
  bluePlayers,
  redPlayers,
  expandedPosition,
  onToggle,
}) => {
  const getPlayerByPosition = (
    players: PlayerStat[],
    position: PositionType
  ): PlayerStat | undefined => {
    return players.find(p => p.position === position);
  };

  const handleToggle = (position: string) => {
    onToggle(position);
  };

  return (
    <div className="max-w-5xl mx-auto mt-4">
      {POSITION_ORDER.map(position => {
        const bluePlayer = getPlayerByPosition(bluePlayers, position);
        const redPlayer = getPlayerByPosition(redPlayers, position);

        if (!bluePlayer || !redPlayer) return null;

        return (
          <PlayerStatsRow
            key={position}
            bluePlayer={bluePlayer}
            redPlayer={redPlayer}
            isExpanded={expandedPosition === position}
            onToggle={() => handleToggle(position)}
          />
        );
      })}
    </div>
  );
};

export default PlayerStatsList;
