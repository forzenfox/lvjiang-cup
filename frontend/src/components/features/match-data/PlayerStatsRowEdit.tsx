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
import { getChampionIconUrl } from '@/utils/championUtils';

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
  isExpanded,
  onToggle,
  modifiedFields,
  onFieldChange,
}) => {
  const isFieldModified = (playerId: string, field: string): boolean => {
    return modifiedFields.has(`${playerId}.${field}`);
  };

  const renderEditableStat = (
    playerId: string,
    field: string,
    value: number | string,
    displayValue: string,
    className: string
  ) => {
    const isModified = isFieldModified(playerId, field);

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={e => onFieldChange(playerId, field, parseInt(e.target.value) || 0)}
          className={`w-12 px-1 py-0.5 text-center bg-[#1a1a2e] border-2 rounded text-sm font-mono ${className} ${
            isModified ? 'border-[#c49f58] animate-pulse' : 'border-transparent'
          } focus:border-[#c49f58] focus:outline-none transition-colors`}
        />
      );
    }

    return <span className={`font-mono ${className}`}>{displayValue}</span>;
  };

  return (
    <div
      className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] hover:translate-y-[-2px]
                 rounded-lg p-4 mb-2 cursor-pointer transition-all duration-200"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full border-2 border-[#f44336]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            <img
              src={getChampionIconUrl(redPlayer.championName)}
              alt={redPlayer.championName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden">{redPlayer.championName.charAt(0)}</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <PositionIcon position={redPlayer.position} size={16} />
              <span className="text-sm font-bold text-white">{redPlayer.playerName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {renderEditableStat(
                  redPlayer.playerId,
                  'kills',
                  redPlayer.kills,
                  String(redPlayer.kills),
                  'text-[#f44336]'
                )}
                <span className="text-gray-500">/</span>
                {renderEditableStat(
                  redPlayer.playerId,
                  'deaths',
                  redPlayer.deaths,
                  String(redPlayer.deaths),
                  'text-gray-400'
                )}
                <span className="text-gray-500">/</span>
                {renderEditableStat(
                  redPlayer.playerId,
                  'assists',
                  redPlayer.assists,
                  String(redPlayer.assists),
                  'text-[#f44336]'
                )}
              </div>
              <span className="text-xs text-gray-400">
                CS:{' '}
                {renderEditableStat(
                  redPlayer.playerId,
                  'cs',
                  redPlayer.cs,
                  String(redPlayer.cs),
                  'text-gray-400'
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-4">
          <span className="text-xs text-gray-500 font-bold">VS</span>
          <div className="flex items-center gap-2">
            {redPlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded">
                MVP
              </span>
            )}
            {redPlayer.firstBlood && <span className="text-xs text-red-400 font-bold">一血</span>}
            {bluePlayer.mvp && (
              <span className="text-xs text-[#c49f58] font-bold bg-[#c49f58]/20 px-1.5 py-0.5 rounded">
                MVP
              </span>
            )}
            {bluePlayer.firstBlood && <span className="text-xs text-red-400 font-bold">一血</span>}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{bluePlayer.playerName}</span>
              <PositionIcon position={bluePlayer.position} size={16} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                CS:{' '}
                {renderEditableStat(
                  bluePlayer.playerId,
                  'cs',
                  bluePlayer.cs,
                  String(bluePlayer.cs),
                  'text-gray-400'
                )}
              </span>
              <div className="flex items-center gap-1">
                {renderEditableStat(
                  bluePlayer.playerId,
                  'kills',
                  bluePlayer.kills,
                  String(bluePlayer.kills),
                  'text-[#00bcd4]'
                )}
                <span className="text-gray-500">/</span>
                {renderEditableStat(
                  bluePlayer.playerId,
                  'deaths',
                  bluePlayer.deaths,
                  String(bluePlayer.deaths),
                  'text-gray-400'
                )}
                <span className="text-gray-500">/</span>
                {renderEditableStat(
                  bluePlayer.playerId,
                  'assists',
                  bluePlayer.assists,
                  String(bluePlayer.assists),
                  'text-[#00bcd4]'
                )}
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#00bcd4]/50 bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
            <img
              src={getChampionIconUrl(bluePlayer.championName)}
              alt={bluePlayer.championName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden">{bluePlayer.championName.charAt(0)}</span>
          </div>
        </div>
      </div>

      <div className="md:hidden mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col items-start">
            <span className="text-[#f44336] font-bold">{redPlayer.playerName}</span>
            <span className="text-gray-400 text-xs">{redPlayer.championName}</span>
            <span className="text-[#f44336] font-mono">{redPlayer.kda}</span>
          </div>
          <div className="flex flex-col items-center">
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#00bcd4] font-bold">{bluePlayer.playerName}</span>
            <span className="text-gray-400 text-xs">{bluePlayer.championName}</span>
            <span className="text-[#00bcd4] font-mono">{bluePlayer.kda}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsRowEdit;
