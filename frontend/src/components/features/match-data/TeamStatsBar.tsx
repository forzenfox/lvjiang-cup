import React from 'react';
import type { TeamGameData, BanData } from '@/types/matchData';
import { getChampionIconByEn } from '@/utils/championUtils';
import { Swords, Coins, Castle, Crown, Flame } from 'lucide-react';

interface TeamStatsBarProps {
  blueTeam: TeamGameData;
  redTeam: TeamGameData;
  bans?: BanData;
}

/**
 * 格式化金币显示
 * @param gold 金币数量
 * @returns 格式化后的字符串 (如 "69.7k")
 */
const formatGold = (gold: number): string => {
  return `${(gold / 1000).toFixed(1)}k`;
};

/**
 * BAN展示组件
 */
const BanDisplay: React.FC<{ bans: string[]; side: 'red' | 'blue' }> = ({ bans, side }) => {
  const borderColor = side === 'red' ? 'border-[#f44336]/30' : 'border-[#00bcd4]/30';
  const textColor = side === 'red' ? 'text-[#f44336]' : 'text-[#00bcd4]';

  return (
    <div className={`flex flex-col gap-2 ${side === 'red' ? 'items-start' : 'items-end'}`}>
      <span className={`text-xs ${textColor} font-bold`}>BAN</span>
      <div className="flex gap-1.5">
        {bans.map((championId, index) => (
          <div
            key={`${side}-${index}`}
            className={`w-8 h-8 rounded border ${borderColor} bg-gray-800 overflow-hidden opacity-70 grayscale hover:grayscale-0 transition-all duration-200`}
            title={`BAN: ${championId}`}
          >
            <img
              src={getChampionIconByEn(championId)}
              alt={championId}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
        {/* 补齐空位到5个 */}
        {Array.from({ length: 5 - bans.length }).map((_, index) => (
          <div
            key={`${side}-empty-${index}`}
            className={`w-8 h-8 rounded border ${borderColor} bg-gray-800/30 opacity-30`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 队伍数据统计栏组件
 * 展示双方队伍的对局数据对比：击杀、经济、推塔、龙、男爵、BAN位
 */
const TeamStatsBar: React.FC<TeamStatsBarProps> = ({ blueTeam, redTeam, bans }) => {
  return (
    <div className="bg-[#2d2d2d] rounded-xl p-6 max-w-5xl mx-auto mt-4">
      {/* 数据对比区域 */}
      <div className="flex items-center justify-between mb-6">
        {/* 左侧：红色方数据 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Crown className="w-4 h-4" />
              <span className="text-xs">男爵</span>
            </div>
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.barons}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs">小龙</span>
            </div>
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.dragons}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Castle className="w-4 h-4" />
              <span className="text-xs">防御塔</span>
            </div>
            <span className="text-lg font-bold text-[#f44336] font-mono">{redTeam.towers}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Coins className="w-4 h-4" />
              <span className="text-xs">金币</span>
            </div>
            <span className="text-lg font-bold text-[#f44336] font-mono">
              {formatGold(redTeam.gold)}
            </span>
          </div>
        </div>

        {/* 中间：击杀数对比 */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="text-5xl font-bold text-[#f44336] font-mono neon-glow-red">
              {redTeam.kills}
            </span>
            <Swords className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
            <span className="text-5xl font-bold text-[#00bcd4] font-mono neon-glow-blue">
              {blueTeam.kills}
            </span>
          </div>
          <span className="text-xs text-gray-500">击杀数</span>
        </div>

        {/* 右侧：蓝色方数据 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 justify-end">
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.barons}</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-xs">男爵</span>
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.dragons}</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-xs">小龙</span>
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <span className="text-lg font-bold text-[#00bcd4] font-mono">{blueTeam.towers}</span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-xs">防御塔</span>
              <Castle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <span className="text-lg font-bold text-[#00bcd4] font-mono">
              {formatGold(blueTeam.gold)}
            </span>
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="text-xs">金币</span>
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 分隔线 */}
      {bans && (bans.red.length > 0 || bans.blue.length > 0) && (
        <div className="border-t border-white/10 pt-4">
          {/* BAN位展示区域 */}
          <div className="flex justify-between items-center">
            <BanDisplay bans={bans.red} side="red" />
            <span className="text-xs text-gray-500 font-bold tracking-wider">BAN / PICK</span>
            <BanDisplay bans={bans.blue} side="blue" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatsBar;
