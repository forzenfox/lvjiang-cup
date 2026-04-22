import React from 'react';
import type { TeamGameData } from '@/types/matchData';

interface TeamStatsBarEditProps {
  blueTeam: TeamGameData;
  redTeam: TeamGameData;
  modifiedFields: Set<string>;
  onFieldChange: (team: 'blue' | 'red', field: string, value: number) => void;
}

const TeamStatsBarEdit: React.FC<TeamStatsBarEditProps> = ({
  blueTeam,
  redTeam,
  modifiedFields,
  onFieldChange,
}) => {
  const formatGold = (gold: number): string => {
    return `${(gold / 1000).toFixed(1)}k`;
  };

  const renderEditableField = (
    team: 'blue' | 'red',
    field: string,
    value: number,
    displayValue: string,
    colorClass: string
  ) => {
    const fieldKey = `${team}.${field}`;
    const isModified = modifiedFields.has(fieldKey);

    return (
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">
          {field === 'kills'
            ? '击杀'
            : field === 'gold'
              ? '经济'
              : field === 'towers'
                ? '推塔'
                : field === 'dragons'
                  ? '龙'
                  : '男爵'}
        </span>
        <input
          type="number"
          value={value}
          onChange={e => onFieldChange(team, field, parseInt(e.target.value) || 0)}
          className={`w-16 px-2 py-1 text-center bg-[#1a1a2e] border-2 rounded-md text-lg font-bold font-mono ${colorClass} ${
            isModified ? 'border-[#c49f58] animate-pulse' : 'border-transparent'
          } focus:border-[#c49f58] focus:outline-none transition-colors`}
        />
      </div>
    );
  };

  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4 max-w-5xl mx-auto mt-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-4">
          <span className="text-lg font-bold text-[#00bcd4]">{blueTeam.teamName}</span>
          <div className="text-4xl font-bold text-[#00bcd4] font-mono">
            {renderEditableField(
              'blue',
              'kills',
              blueTeam.kills,
              String(blueTeam.kills),
              'text-[#00bcd4]'
            )}
          </div>
          <span className="text-xs text-gray-400">击杀</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-600">
          <span className="text-2xl">⚔</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-lg font-bold text-[#f44336]">{redTeam.teamName}</span>
          <div className="text-4xl font-bold text-[#f44336] font-mono">
            {renderEditableField(
              'red',
              'kills',
              redTeam.kills,
              String(redTeam.kills),
              'text-[#f44336]'
            )}
          </div>
          <span className="text-xs text-gray-400">击杀</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">经济</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#00bcd4] font-mono">
              {formatGold(blueTeam.gold)}
            </span>
            <span className="text-gray-600">:</span>
            <span className="text-lg font-bold text-[#f44336] font-mono">
              {formatGold(redTeam.gold)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">推塔</span>
          <div className="flex items-center gap-1">
            {renderEditableField(
              'blue',
              'towers',
              blueTeam.towers,
              String(blueTeam.towers),
              'text-[#00bcd4]'
            )}
            <span className="text-gray-600">:</span>
            {renderEditableField(
              'red',
              'towers',
              redTeam.towers,
              String(redTeam.towers),
              'text-[#f44336]'
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">龙</span>
          <div className="flex items-center gap-1">
            {renderEditableField(
              'blue',
              'dragons',
              blueTeam.dragons,
              String(blueTeam.dragons),
              'text-[#00bcd4]'
            )}
            <span className="text-gray-600">:</span>
            {renderEditableField(
              'red',
              'dragons',
              redTeam.dragons,
              String(redTeam.dragons),
              'text-[#f44336]'
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-400">男爵</span>
          <div className="flex items-center gap-1">
            {renderEditableField(
              'blue',
              'barons',
              blueTeam.barons,
              String(blueTeam.barons),
              'text-[#00bcd4]'
            )}
            <span className="text-gray-600">:</span>
            {renderEditableField(
              'red',
              'barons',
              redTeam.barons,
              String(redTeam.barons),
              'text-[#f44336]'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsBarEdit;
