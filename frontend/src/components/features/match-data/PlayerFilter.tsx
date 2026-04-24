import React from 'react';
import type { PositionType } from '@/types/matchData';
import { Filter, X } from 'lucide-react';

interface PlayerFilterProps {
  teamFilter: 'all' | 'teamA' | 'teamB';
  positionFilter: 'all' | PositionType;
  teamAName?: string;
  teamBName?: string;
  onTeamChange: (filter: 'all' | 'teamA' | 'teamB') => void;
  onPositionChange: (filter: 'all' | PositionType) => void;
}

const POSITIONS: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const PlayerFilter: React.FC<PlayerFilterProps> = ({
  teamFilter,
  positionFilter,
  teamAName,
  teamBName,
  onTeamChange,
  onPositionChange,
}) => {
  const hasActiveFilter = teamFilter !== 'all' || positionFilter !== 'all';

  const handleReset = () => {
    onTeamChange('all');
    onPositionChange('all');
  };

  return (
    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 max-w-5xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#c49f58]" />
          <span className="text-sm font-bold text-white">筛选</span>
        </div>
        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            重置
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">战队</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTeamChange('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                teamFilter === 'all'
                  ? 'bg-[#c49f58] text-[#1E3A8A] font-medium'
                  : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d]'
              }`}
            >
              全部战队
            </button>
            {teamAName && (
              <button
                onClick={() => onTeamChange('teamA')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  teamFilter === 'teamA'
                    ? 'bg-[#00bcd4] text-white font-medium'
                    : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d]'
                }`}
              >
                {teamAName}
              </button>
            )}
            {teamBName && (
              <button
                onClick={() => onTeamChange('teamB')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  teamFilter === 'teamB'
                    ? 'bg-[#f44336] text-white font-medium'
                    : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d]'
                }`}
              >
                {teamBName}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">位置</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPositionChange('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                positionFilter === 'all'
                  ? 'bg-[#c49f58] text-[#1E3A8A] font-medium'
                  : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d]'
              }`}
            >
              全部位置
            </button>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => onPositionChange(pos)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  positionFilter === pos
                    ? 'bg-[#c49f58] text-[#1E3A8A] font-medium'
                    : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d]'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerFilter);
