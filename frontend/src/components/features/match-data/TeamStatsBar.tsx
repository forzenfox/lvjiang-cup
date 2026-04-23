import React from 'react';
import type { TeamGameData } from '@/types/matchData';
import { Swords } from 'lucide-react';

interface TeamStatsBarProps {
  blueTeam: TeamGameData;
  redTeam: TeamGameData;
}

const TeamStatsBar: React.FC<TeamStatsBarProps> = ({ blueTeam, redTeam }) => {
  const formatGold = (gold: number): string => {
    return `${(gold / 1000).toFixed(1)}k`;
  };

  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4 max-w-5xl mx-auto mt-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-bold text-[#f44336]">{redTeam.teamName}</span>
          <div className="text-4xl font-bold text-[#f44336] font-mono neon-glow-red">
            {redTeam.kills}
          </div>
          <span className="text-xs text-gray-400">击杀</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Swords className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-lg font-bold text-[#00bcd4]">{blueTeam.teamName}</span>
          <div className="text-4xl font-bold text-[#00bcd4] font-mono neon-glow-blue">
            {blueTeam.kills}
          </div>
          <span className="text-xs text-gray-400">击杀</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">经济</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#f44336] font-mono">
              {formatGold(redTeam.gold)}
            </span>
            <span className="text-gray-600">:</span>
            <span className="text-lg font-bold text-[#00bcd4] font-mono">
              {formatGold(blueTeam.gold)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">推塔</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.towers}</span>
            <span className="text-gray-600">:</span>
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.towers}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">龙</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.dragons}</span>
            <span className="text-gray-600">:</span>
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.dragons}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">男爵</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.barons}</span>
            <span className="text-gray-600">:</span>
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.barons}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsBar;
