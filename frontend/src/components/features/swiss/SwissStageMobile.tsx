import React, { useState, useMemo } from 'react';
import { Match, Team } from '@/types';
import SwissRoundTabs from './SwissRoundTabs';
import SwissMatchCardMobile from './SwissMatchCardMobile';
import SwissFinalResultMobile from './SwissFinalResultMobile';
import type { SwissColumnConfig } from '@/lib/format';

interface SwissStageMobileProps {
  matches: Match[];
  teams: Team[];
  /** 轮次列视图模型（来自 buildSwissColumns，由父组件按生效配置推导） */
  columns: SwissColumnConfig[];
  advancement?: {
    top8: string[];
    eliminated: string[];
    rankings?: { teamId: string; record: string; rank: number }[];
  };
  onMatchClick?: (match: Match) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissStageMobile: React.FC<SwissStageMobileProps> = ({
  matches,
  teams,
  columns,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-stage-mobile',
}) => {
  // 移动端使用动态标签：各轮次 + 最终结果（最后一列为最终结果列）
  const [selectedRound, setSelectedRound] = useState<number>(columns[0]?.id ?? 1);
  const finalColumnId = columns.length > 0 ? columns[columns.length - 1].id : -1;

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

  // 当前轮次列（从视图模型取，列名与轮次号均来自推导结果）
  const currentColumn = columns.find(col => col.id === selectedRound);

  // 获取所有晋级队伍
  const allQualifiedTeams = useMemo(() => {
    if (!advancement?.top8) return [];
    return teams.filter(t => advancement.top8.includes(t.id));
  }, [teams, advancement]);

  // 获取所有淘汰队伍
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
        rankings={advancement?.rankings}
        data-testid={`${testId}-final-result`}
      />
    );
  };

  // 渲染战绩分组标题
  const renderRecordTitle = (roundLabel: string, record: string) => (
    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2 pl-3 border-l-2 border-[#F59E0B]">
      {roundLabel} {record}
    </h4>
  );

  // 渲染各轮次的对战信息（仅比赛组，晋级/淘汰组由最终结果视图展示）
  const renderRoundContent = () => {
    if (!currentColumn) return null;

    return (
      <div data-testid={`${testId}-content`}>
        {currentColumn.records
          .filter(record => record.type === 'matches')
          .map(record => {
            const recordMatches = matchesByRecord[record.record] || [];

            return (
              <div
                key={record.record}
                className="mb-3"
                data-testid={`${testId}-round-${record.record}`}
              >
                {renderRecordTitle(currentColumn.name, record.record)}
                <div className="space-y-1">
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
        rounds={columns.slice(0, -1).map(col => ({ round: col.id, label: col.name }))}
        selectedRound={selectedRound}
        onRoundChange={setSelectedRound}
        showFinalResult={true}
        className="mb-4"
      />

      {selectedRound === finalColumnId ? renderFinalResult() : renderRoundContent()}
    </div>
  );
};

export default SwissStageMobile;
