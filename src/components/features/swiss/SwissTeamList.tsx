import React from 'react';
import { Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';

interface SwissTeamListProps {
  teams: Team[];
  ids: string[];
  onRemove?: (id: string) => void;
}

const SwissTeamList: React.FC<SwissTeamListProps> = ({ teams, ids, onRemove }) => {
  if (ids.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {ids.map((id) => {
        const team = teams.find((t) => t.id === id);
        if (!team) return null;

        return (
          <div
            key={id}
            className="flex items-center justify-between text-sm text-gray-300 bg-gray-800/50 p-1.5 rounded group"
          >
            <div className="flex items-center gap-2">
              <SwissTeamLogo team={team} />
              <span>{team.name}</span>
            </div>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SwissTeamList;
