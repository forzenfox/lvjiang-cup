import React, { useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRoundColumn from './SwissRoundColumn';
import SwissRecordGroup from './SwissRecordGroup';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';

interface SwissBo3ViewProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    top8: string[];
    eliminated: string[];
  };
  onMatchClick?: (match: Match) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissBo3View: React.FC<SwissBo3ViewProps> = ({
  matches,
  teams,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-bo3-view',
}) => {
  const matchesByRecord = useMemo(() => {
    const result: Record<string, Match[]> = {};
    for (const match of matches) {
      const record = match.swissRecord || '0-0';
      if (!result[record]) {
        result[record] = [];
      }
      result[record].push(match);
    }
    return result;
  }, [matches]);

  const qualifiedTeams = useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  const eliminatedTeams = useMemo(() => {
    if (!advancement?.eliminated) return [];
    return teams.filter(t => advancement.eliminated.includes(t.id));
  }, [teams, advancement]);

  const bo3Rounds = SWISS_STAGE_CONFIG.rounds.filter(r =>
    SWISS_STAGE_CONFIG.bo3Rounds.includes(r.round as 4 | 5)
  );

  return (
    <div
      className={`flex gap-6 overflow-x-auto pb-4 ${className}`}
      style={{
        width: '100%',
        minHeight: '710px',
      }}
      data-testid={testId}
    >
      {bo3Rounds.map((roundConfig) => (
        <div
          key={roundConfig.round}
          className="flex gap-4"
          style={{ marginRight: '72px' }}
        >
          {roundConfig.records.map((record) => {
            const recordMatches = matchesByRecord[record] || [];

            if (roundConfig.round === 4) {
              const isQualifiedGroup = record === '3-1';
              const isEliminatedGroup = record === '1-3';

              if (isQualifiedGroup) {
                return (
                  <SwissRecordGroup
                    key={record}
                    type="qualified"
                    title="晋级"
                    teams={qualifiedTeams}
                    data-testid={`${testId}-qualified-3-1`}
                  />
                );
              }

              if (isEliminatedGroup) {
                return (
                  <SwissRecordGroup
                    key={record}
                    type="eliminated"
                    title="淘汰"
                    teams={eliminatedTeams}
                    data-testid={`${testId}-eliminated-1-3`}
                  />
                );
              }
            }

            if (roundConfig.round === 5) {
              const isQualifiedGroup = record === '3-2';
              const isEliminatedGroup = record === '2-3';

              if (isQualifiedGroup) {
                return (
                  <SwissRecordGroup
                    key={record}
                    type="qualified"
                    title="晋级"
                    teams={qualifiedTeams}
                    data-testid={`${testId}-qualified-3-2`}
                  />
                );
              }

              if (isEliminatedGroup) {
                return (
                  <SwissRecordGroup
                    key={record}
                    type="eliminated"
                    title="淘汰"
                    teams={eliminatedTeams}
                    data-testid={`${testId}-eliminated-2-3`}
                  />
                );
              }
            }

            return (
              <SwissRoundColumn
                key={record}
                title={roundConfig.label}
                record={record}
                matches={recordMatches}
                teams={teams}
                onMatchClick={onMatchClick}
                data-testid={`${testId}-round-${roundConfig.round}-${record}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SwissBo3View;
