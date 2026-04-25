import React from 'react';
import type { PlayerStat, PositionType } from '@/types/matchData';
import {
  TopIcon,
  JungleIcon,
  MidIcon,
  AdcIcon,
  SupportIcon,
} from '@/components/icons/PositionIcons';
import {
  getChampionIconByEn,
  getChampionTitleByEn,
  getChampionNameToEn,
} from '@/utils/championUtils';
import { getUploadUrl } from '@/utils/upload';

const PositionIcon: React.FC<{ position: PositionType }> = ({ position }) => {
  switch (position) {
    case 'TOP':
      return <TopIcon />;
    case 'JUNGLE':
      return <JungleIcon />;
    case 'MID':
      return <MidIcon />;
    case 'ADC':
      return <AdcIcon />;
    case 'SUPPORT':
      return <SupportIcon />;
    default:
      return null;
  }
};

interface PlayerStatsRowEditProps {
  bluePlayer: PlayerStat;
  redPlayer: PlayerStat;
  isExpanded: boolean;
  onToggle: () => void;
  modifiedFields: Set<string>;
  onFieldChange: (playerId: string, field: string, value: number | string) => void;
}

const PlayerStatsRowEdit: React.FC<PlayerStatsRowEditProps> = ({
  bluePlayer,
  redPlayer,
  isExpanded: _isExpanded,
  onToggle,
  modifiedFields,
  onFieldChange,
}) => {
  const _formatGold = (gold: number): string => {
    return `${(gold / 1000).toFixed(1)}k`;
  };

  const handleRowClick = () => {
    onToggle();
  };

  const getPlayerAvatar = (player: PlayerStat): string | null => {
    return player.playerAvatarUrl ? getUploadUrl(player.playerAvatarUrl) : null;
  };

  const getChampionIcon = (cnName: string): string => {
    const nameToEn = getChampionNameToEn();
    const enId = nameToEn[cnName] || cnName;
    return getChampionIconByEn(enId);
  };

  const isFieldModified = (playerId: string, field: string): boolean => {
    return modifiedFields.has(`${playerId}.${field}`);
  };

  const renderEditableStat = (
    playerId: string,
    field: string,
    value: number,
    className: string
  ) => {
    const isModified = isFieldModified(playerId, field);
    return (
      <input
        type="number"
        value={value}
        onChange={e => onFieldChange(playerId, field, parseInt(e.target.value) || 0)}
        onClick={e => e.stopPropagation()}
        className={`w-12 px-1 py-0.5 text-center bg-[#1a1a2e] border-2 rounded text-sm font-mono ${className} ${
          isModified ? 'border-[#c49f58] animate-pulse' : 'border-transparent'
        } focus:border-[#c49f58] focus:outline-none transition-colors`}
      />
    );
  };

  return (
    <div
      data-testid={`player-row-${redPlayer.position}`}
      className="bg-[#2d2d2d] hover:bg-[#27252c]
                 py-5 px-4 cursor-pointer transition-all duration-200 border-b border-white/10"
      onClick={handleRowClick}
    >
      <div className="flex items-center justify-between">
        {/* 左侧：红色方 - 列宽与表头完全一致 */}
        <div className="flex items-center gap-2" style={{ width: 532 }}>
          {/* 选手头像和昵称 - 上下布局 */}
          <div className="flex flex-col items-center gap-1" style={{ width: 100 }}>
            <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {getPlayerAvatar(redPlayer) ? (
                <img
                  src={getPlayerAvatar(redPlayer)!}
                  alt={redPlayer.playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  {redPlayer.playerName.slice(0, 1)}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-white truncate" style={{ maxWidth: 100 }}>
              {redPlayer.playerName}
            </span>
          </div>

          {/* 英雄图标 */}
          <div className="w-[100px] text-center">
            <div className="relative inline-block">
              {redPlayer.mvp && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-transparent text-[#f44336] text-[10px] font-extrabold rounded border-2 border-[#f44336] shadow-lg shadow-red-500/50 z-10 whitespace-nowrap">
                  MVP
                </span>
              )}
              <div
                className="w-14 h-14 rounded border border-[#f44336]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden mx-auto"
                title={getChampionTitleByEn(
                  getChampionNameToEn()[redPlayer.championName] || redPlayer.championName
                )}
              >
                <img
                  src={getChampionIcon(redPlayer.championName)}
                  alt={redPlayer.championName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xs">{redPlayer.championName.charAt(0)}</span>
              </div>
            </div>
          </div>

          {/* KDA - 可编辑 */}
          <div className="w-[100px] text-center">
            <div className="flex items-center justify-center gap-1">
              {renderEditableStat(redPlayer.playerId, 'kills', redPlayer.kills, 'text-[#f44336]')}
              <span className="text-gray-500">/</span>
              {renderEditableStat(redPlayer.playerId, 'deaths', redPlayer.deaths, 'text-gray-400')}
              <span className="text-gray-500">/</span>
              {renderEditableStat(
                redPlayer.playerId,
                'assists',
                redPlayer.assists,
                'text-[#f44336]'
              )}
            </div>
          </div>

          {/* 金币 - 可编辑 */}
          <div className="w-[60px] text-center">
            {renderEditableStat(redPlayer.playerId, 'gold', redPlayer.gold, 'text-[#c49f58]')}
          </div>

          {/* 补刀 - 可编辑 */}
          <div className="w-[50px] text-center">
            {renderEditableStat(redPlayer.playerId, 'cs', redPlayer.cs, 'text-gray-400')}
          </div>
        </div>

        {/* 中间：位置图标 - 固定宽度64px */}
        <div className="flex items-center justify-center" style={{ width: 64 }}>
          <div className="flex items-center justify-center">
            <PositionIcon position={redPlayer.position} />
          </div>
        </div>

        {/* 右侧：蓝色方 - 列宽与表头完全一致 */}
        <div className="flex items-center gap-2 justify-end" style={{ width: 532 }}>
          {/* 补刀 - 可编辑 */}
          <div className="w-[50px] text-center">
            {renderEditableStat(bluePlayer.playerId, 'cs', bluePlayer.cs, 'text-gray-400')}
          </div>

          {/* 金币 - 可编辑 */}
          <div className="w-[60px] text-center">
            {renderEditableStat(bluePlayer.playerId, 'gold', bluePlayer.gold, 'text-[#c49f58]')}
          </div>

          {/* KDA - 可编辑 */}
          <div className="w-[100px] text-center">
            <div className="flex items-center justify-center gap-1">
              {renderEditableStat(bluePlayer.playerId, 'kills', bluePlayer.kills, 'text-[#00bcd4]')}
              <span className="text-gray-500">/</span>
              {renderEditableStat(
                bluePlayer.playerId,
                'deaths',
                bluePlayer.deaths,
                'text-gray-400'
              )}
              <span className="text-gray-500">/</span>
              {renderEditableStat(
                bluePlayer.playerId,
                'assists',
                bluePlayer.assists,
                'text-[#00bcd4]'
              )}
            </div>
          </div>

          {/* 英雄图标 */}
          <div className="w-[100px] text-center">
            <div className="relative inline-block">
              {bluePlayer.mvp && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-transparent text-[#f44336] text-[10px] font-extrabold rounded border-2 border-[#f44336] shadow-lg shadow-red-500/50 z-10 whitespace-nowrap">
                  MVP
                </span>
              )}
              <div
                className="w-14 h-14 rounded border border-[#00bcd4]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden mx-auto"
                title={getChampionTitleByEn(
                  getChampionNameToEn()[bluePlayer.championName] || bluePlayer.championName
                )}
              >
                <img
                  src={getChampionIcon(bluePlayer.championName)}
                  alt={bluePlayer.championName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-xs">{bluePlayer.championName.charAt(0)}</span>
              </div>
            </div>
          </div>

          {/* 选手头像和昵称 - 上下布局 */}
          <div className="flex flex-col items-center gap-1" style={{ width: 100 }}>
            <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {getPlayerAvatar(bluePlayer) ? (
                <img
                  src={getPlayerAvatar(bluePlayer)!}
                  alt={bluePlayer.playerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  {bluePlayer.playerName.slice(0, 1)}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-white truncate" style={{ maxWidth: 100 }}>
              {bluePlayer.playerName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsRowEdit;
