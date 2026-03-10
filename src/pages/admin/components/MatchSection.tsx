import React from 'react';
import { Match, Team } from '../../../types';
import MatchRow from './MatchRow';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { TempMatch } from '../hooks/useTempMatchManager';

export interface MatchSectionProps {
  title: string;
  description: string;
  matches: Match[];
  teams: Team[];
  tempMatches: TempMatch<Match>[];
  searchTerm: string;
  onUpdate: (match: Match) => void;
  onDelete: (matchId: string) => void;
  onAdd: (match: Omit<Match, 'id'>) => void;
  onCancel: (tempId: string) => void;
  loading: boolean;
  containerClassName?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  matchRowProps?: {
    fixedSwissRecord?: string;
  };
}

export const MatchSection: React.FC<MatchSectionProps> = ({
  title,
  description,
  matches,
  teams,
  tempMatches,
  searchTerm,
  onUpdate,
  onDelete,
  onAdd,
  onCancel,
  loading,
  containerClassName = 'mb-6 bg-gray-900/30 rounded-lg border border-gray-800 overflow-hidden',
  showAddButton = true,
  onAddClick,
  matchRowProps,
}) => {
  const filteredMatches = searchTerm
    ? matches.filter(m => {
        const lower = searchTerm.toLowerCase();
        const teamA = teams.find(t => t.id === m.teamAId)?.name.toLowerCase() || '';
        const teamB = teams.find(t => t.id === m.teamBId)?.name.toLowerCase() || '';
        return teamA.includes(lower) || teamB.includes(lower);
      })
    : matches;

  if (filteredMatches.length === 0 && searchTerm && tempMatches.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
            {filteredMatches.length} 场
          </span>
          {showAddButton && !searchTerm && onAddClick && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onAddClick}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 h-7 px-2"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加
            </Button>
          )}
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <MatchRow
              key={match.id}
              match={match}
              teams={teams}
              onUpdate={onUpdate}
              onDelete={onDelete}
              loading={loading}
              {...matchRowProps}
            />
          ))
        ) : (
          !searchTerm && tempMatches.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              暂无比赛
            </div>
          )
        )}

        {tempMatches.map(tempMatch => (
          <MatchRow
            key={tempMatch.id}
            match={tempMatch.match}
            teams={teams}
            onUpdate={onUpdate}
            onAdd={(match) => {
              onAdd(match);
              onCancel(tempMatch.id);
            }}
            onCancel={() => onCancel(tempMatch.id)}
            loading={loading}
            isNew={true}
            {...matchRowProps}
          />
        ))}
      </div>
    </div>
  );
};
