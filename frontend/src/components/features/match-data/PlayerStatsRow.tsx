import React from 'react';
import type { PlayerStat, PositionType } from '@/types/matchData';
import { ChevronDown } from 'lucide-react';
import {
  TopIcon,
  JungleIcon,
  MidIcon,
  AdcIcon,
  SupportIcon,
} from '@/components/icons/PositionIcons';

const PositionIcon: React.FC<{ position: PositionType; size?: number }> = ({ position, size = 16 }) => {
  switch (position) {
    case 'TOP':
      return <TopIcon style={{ width: size, height: size * 0.75 }} />;
    case 'JUNGLE':
      return <JungleIcon style={{ width: size, height: size * 0.75 }} />;
    case 'MID':
      return <MidIcon style={{ width: size, height: size * 0.75 }} />;
    case 'ADC':
      return <AdcIcon style={{ width: size, height: size * 0.75 }} />;
    case 'SUPPORT':
      return <SupportIcon style={{ width: size, height: size * 0.75 }} />;
    default:
      return null;
  }
};

interface PlayerStatsRowProps {
  bluePlayer: PlayerStat;
  redPlayer: PlayerStat;
  isExpanded: boolean;
  onToggle: () => void;
}

const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
  bluePlayer,
  redPlayer,
  isExpanded,
  onToggle,
}) => {
  const formatGold = (gold: number): string => {
    return `${(gold / 1000).toFixed(1)}k`;
  };

  const handleRowClick = () => {
    onToggle();
  };

  return (
    <div
      className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] hover:translate-y-[-2px]
                 rounded-lg p-4 mb-2 cursor-pointer transition-all duration-200"
      onClick={handleRowClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full border-2 border-[#00bcd4]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            {bluePlayer.championName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <PositionIcon position={bluePlayer.position} size={16} />
              <span className="text-sm font-bold text-white">{bluePlayer.playerName}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-[#00bcd4] font-mono font-bold">{bluePlayer.kda}</span>
              <span className="text-xs text-gray-400">CS: {bluePlayer.cs}</span>
              <span className="text-xs text-[#c49f58] font-mono">
                {formatGold(bluePlayer.gold)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-xs text-gray-500 font-bold">VS</span>
          <div className="flex items-center gap-2">
            {bluePlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded">
                MVP
              </span>
            )}
            {bluePlayer.firstBlood && <span className="text-xs text-red-400 font-bold">一血</span>}
            {redPlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded">
                MVP
              </span>
            )}
            {redPlayer.firstBlood && <span className="text-xs text-red-400 font-bold">一血</span>}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{redPlayer.playerName}</span>
              <PositionIcon position={redPlayer.position} size={16} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#c49f58] font-mono">{formatGold(redPlayer.gold)}</span>
              <span className="text-xs text-gray-400">CS: {redPlayer.cs}</span>
              <span className="text-sm text-[#f44336] font-mono font-bold">{redPlayer.kda}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#f44336]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            {redPlayer.championName.charAt(0)}
          </div>
        </div>
      </div>

      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col items-start">
            <span className="text-[#00bcd4] font-bold">{bluePlayer.playerName}</span>
            <span className="text-gray-400 text-xs">{bluePlayer.championName}</span>
            <span className="text-[#00bcd4] font-mono">{bluePlayer.kda}</span>
          </div>
          <div className="flex flex-col items-center">
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#f44336] font-bold">{redPlayer.playerName}</span>
            <span className="text-gray-400 text-xs">{redPlayer.championName}</span>
            <span className="text-[#f44336] font-mono">{redPlayer.kda}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsRow;
