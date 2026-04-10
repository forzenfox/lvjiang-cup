import React, { useState, useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRoundTabs from './SwissRoundTabs';
import SwissMatchCardMobile from './SwissMatchCardMobile';
import SwissRecordGroup from './SwissRecordGroup';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';

interface SwissStageMobileProps {
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

const SwissStageMobile: React.FC<SwissStageMobileProps> = ({
  matches,
  teams,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-stage-mobile',
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(1);

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

  const currentRoundConfig = SWISS_STAGE_CONFIG.rounds.find(r => r.round === selectedRound);

  const qualifiedTeams = useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  const eliminatedTeams = useMemo(() => {
    if (!advancement?.eliminated) return [];
    return teams.filter(t => advancement.eliminated.includes(t.id));
  }, [teams, advancement]);

  return (
    <div className={className} data-testid={testId}>
      <SwissRoundTabs
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
        className="mb-4"
      />

      <div data-testid={`${testId}-content`}>
        {currentRoundConfig?.records.map((record) => {
          const recordMatches = matchesByRecord[record] || [];

          if (selectedRound === 3) {
            if (record === '2-0') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="qualified"
                  title="2-0 晋级"
                  teams={qualifiedTeams}
                  className="mb-4"
                  data-testid={`${testId}-qualified-2-0`}
                />
              );
            }
            if (record === '0-2') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="eliminated"
                  title="0-2 淘汰"
                  teams={eliminatedTeams}
                  className="mb-4"
                  data-testid={`${testId}-eliminated-0-2`}
                />
              );
            }
          }

          if (selectedRound === 4) {
            if (record === '3-1') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="qualified"
                  title="3-1 晋级"
                  teams={qualifiedTeams}
                  className="mb-4"
                  data-testid={`${testId}-qualified-3-1`}
                />
              );
            }
            if (record === '1-3') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="eliminated"
                  title="1-3 淘汰"
                  teams={eliminatedTeams}
                  className="mb-4"
                  data-testid={`${testId}-eliminated-1-3`}
                />
              );
            }
          }

          if (selectedRound === 5) {
            if (record === '3-2') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="qualified"
                  title="3-2 晋级"
                  teams={qualifiedTeams}
                  className="mb-4"
                  data-testid={`${testId}-qualified-3-2`}
                />
              );
            }
            if (record === '2-3') {
              return (
                <SwissRecordGroup
                  key={record}
                  type="eliminated"
                  title="2-3 淘汰"
                  teams={eliminatedTeams}
                  className="mb-4"
                  data-testid={`${testId}-eliminated-2-3`}
                />
              );
            }
          }

          return (
            <div key={record} className="mb-4" data-testid={`${testId}-round-${record}`}>
              <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                {currentRoundConfig?.label} {record}
              </h4>
              <div className="space-y-2">
                {recordMatches.map((match, index) => (
                  <SwissMatchCardMobile
                    key={match.id}
                    match={match}
                    teams={teams}
                    onClick={onMatchClick ? () => onMatchClick(match) : undefined}
                    data-testid={`${testId}-match-${index}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SwissStageMobile;