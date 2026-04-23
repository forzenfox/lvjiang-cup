import React from 'react';
import type { PlayerStat, PositionType } from '@/types/matchData';
import { ChevronDown, Swords, Shield, Coins, Target, Trophy, Droplets } from 'lucide-react';
import {
  TopIcon,
  JungleIcon,
  MidIcon,
  AdcIcon,
  SupportIcon,
} from '@/components/icons/PositionIcons';
import { getChampionIconUrl } from '@/utils/championUtils';

const PositionIcon: React.FC<{ position: PositionType; size?: number }> = ({
  position,
  size = 16,
}) => {
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

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const handleRowClick = () => {
    onToggle();
  };

  return (
    <div
      className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] hover:translate-y-[-2px]
                 rounded-lg py-3 px-4 mb-1 cursor-pointer transition-all duration-200 border-b border-white/5"
      onClick={handleRowClick}
    >
      <div className="flex items-center justify-between">
        {/* 左侧：红色方选手 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-14 h-14 rounded-full border-2 border-[#f44336]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden flex-shrink-0
                       shadow-[0_0_8px_rgba(244,67,54,0.3)]"
            title={redPlayer.championName}
          >
            <img
              src={getChampionIconUrl(redPlayer.championName)}
              alt={redPlayer.championName}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden">{redPlayer.championName.charAt(0)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <PositionIcon position={redPlayer.position} size={16} />
              <span className="text-sm font-bold text-white truncate">{redPlayer.playerName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-base text-[#f44336] font-mono font-bold">{redPlayer.kda}</span>
              <div className="flex items-center gap-1 text-xs text-[#c49f58]">
                <Coins className="w-3 h-3" />
                <span className="font-mono">{formatGold(redPlayer.gold)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Target className="w-3 h-3" />
                <span className="font-mono">{redPlayer.cs}</span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs">
                <Swords className="w-3 h-3 text-[#f59e0b]" />
                <span className="text-[#f59e0b] font-mono">
                  {formatNumber(redPlayer.damageDealt || 0)}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3 text-[#94a3b8]" />
                <span className="text-[#94a3b8] font-mono">
                  {formatNumber(redPlayer.damageTaken || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：标识区域 */}
        <div className="flex flex-col items-center gap-1 px-2 sm:px-4 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            {redPlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                MVP
              </span>
            )}
            {redPlayer.firstBlood && (
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                一血
              </span>
            )}
            {bluePlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                MVP
              </span>
            )}
            {bluePlayer.firstBlood && (
              <span className="text-xs text-red-400 font-bold flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                一血
              </span>
            )}
          </div>
        </div>

        {/* 右侧：蓝色方选手 */}
        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
          <div className="flex flex-col items-end min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white truncate">{bluePlayer.playerName}</span>
              <PositionIcon position={bluePlayer.position} size={16} />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap justify-end">
              <div className="hidden md:flex items-center gap-1 text-xs">
                <span className="text-[#94a3b8] font-mono">
                  {formatNumber(bluePlayer.damageTaken || 0)}
                </span>
                <Shield className="w-3 h-3 text-[#94a3b8]" />
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs">
                <span className="text-[#f59e0b] font-mono">
                  {formatNumber(bluePlayer.damageDealt || 0)}
                </span>
                <Swords className="w-3 h-3 text-[#f59e0b]" />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className="font-mono">{bluePlayer.cs}</span>
                <Target className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1 text-xs text-[#c49f58]">
                <span className="font-mono">{formatGold(bluePlayer.gold)}</span>
                <Coins className="w-3 h-3" />
              </div>
              <span className="text-base text-[#00bcd4] font-mono font-bold">{bluePlayer.kda}</span>
            </div>
          </div>
          <div
            className="w-14 h-14 rounded-full border-2 border-[#00bcd4]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden flex-shrink-0
                       shadow-[0_0_8px_rgba(0,188,212,0.3)]"
            title={bluePlayer.championName}
          >
            <img
              src={getChampionIconUrl(bluePlayer.championName)}
              alt={bluePlayer.championName}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden">{bluePlayer.championName.charAt(0)}</span>
          </div>
        </div>

        {/* 展开箭头 - 行最右侧 */}
        <div className="flex-shrink-0 ml-2">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsRow;
