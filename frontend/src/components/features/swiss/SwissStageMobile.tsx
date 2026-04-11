import React, { useState, useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRoundTabs from './SwissRoundTabs';
import SwissMatchCardMobile from './SwissMatchCardMobile';
import SwissFinalResultMobile from './SwissFinalResultMobile';
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
  // 移动端使用6个标签：1-5轮 + 最终结果
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

  // 获取所有晋级队伍（3-0, 3-1, 3-2）
  const allQualifiedTeams = useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  // 获取所有淘汰队伍（0-3, 1-3, 2-3）
  const allEliminatedTeams = useMemo(() => {
    if (!advancement?.eliminated) return [];
    return teams.filter(t => advancement.eliminated.includes(t.id));
  }, [teams, advancement]);

  // 渲染最终结果视图 - 使用固定槽位布局
  const renderFinalResult = () => {
    return (
      <SwissFinalResultMobile
        qualifiedTeams={allQualifiedTeams}
        eliminatedTeams={allEliminatedTeams}
        data-testid={`${testId}-final-result`}
      />
    );
  };

  // 渲染前5轮的对战信息
  const renderRoundContent = () => {
    if (!currentRoundConfig) return null;

    return (
      <div data-testid={`${testId}-content`}>
        {currentRoundConfig.records.map((record) => {
          const recordMatches = matchesByRecord[record] || [];

          // 第三轮特殊处理：显示2-0晋级和0-2淘汰
          if (selectedRound === 3) {
            if (record === '2-0') {
              return (
                <div key={record} className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                    第三轮 2-0
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
            }
            if (record === '0-2') {
              return (
                <div key={record} className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                    第三轮 0-2
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
            }
          }

          // 第四轮特殊处理：显示3-1晋级和1-3淘汰
          if (selectedRound === 4) {
            if (record === '2-1') {
              return (
                <div key={record} className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                    第四轮 2-1
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
            }
            if (record === '1-2') {
              return (
                <div key={record} className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                    第四轮 1-2
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
            }
          }

          // 第五轮特殊处理：显示3-2晋级和2-3淘汰
          if (selectedRound === 5) {
            if (record === '2-2') {
              return (
                <div key={record} className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                    第五轮 2-2
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
            }
          }

          // 默认显示对战信息
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
    );
  };

  return (
    <div className={className} data-testid={testId}>
      <SwissRoundTabs
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
        showFinalResult={true}
        className="mb-4"
      />

      {selectedRound === 6 ? renderFinalResult() : renderRoundContent()}
    </div>
  );
};

export default SwissStageMobile;
