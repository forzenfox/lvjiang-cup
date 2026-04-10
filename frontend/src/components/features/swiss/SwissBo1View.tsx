import React, { useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRoundColumn from './SwissRoundColumn';
import SwissRecordGroup from './SwissRecordGroup';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';

interface SwissBo1ViewProps {
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

const SwissBo1View: React.FC<SwissBo1ViewProps> = ({
  matches,
  teams,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-bo1-view',
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

  const bo1Rounds = SWISS_STAGE_CONFIG.rounds.filter(r =>
    SWISS_STAGE_CONFIG.bo1Rounds.includes(r.round as 1 | 2 | 3)
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
      {bo1Rounds.map((roundConfig) => (
        <div
          key={roundConfig.round}
          className="flex gap-4"
          style={{ marginRight: '72px' }}
        >
          {roundConfig.records.map((record) => {
            const recordMatches = matchesByRecord[record] || [];
            const isQualifiedGroup = roundConfig.round === 3 && record === '2-0';
            const isEliminatedGroup = roundConfig.round === 3 && record === '0-2';

            if (isQualifiedGroup) {
              return (
                <SwissRecordGroup
                  key={record}
                  type="qualified"
                  title="晋级"
                  teams={qualifiedTeams}
                  data-testid={`${testId}-qualified-2-0`}
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
                  data-testid={`${testId}-eliminated-0-2`}
                />
              );
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

export default SwissBo1View;
