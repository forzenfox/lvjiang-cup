import React, { useMemo } from 'react';
import { Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';

interface SwissFinalResultMobileProps {
  qualifiedTeams: Team[];
  eliminatedTeams: Team[];
  rankings?: { teamId: string; record: string; rank: number }[];
  className?: string;
  'data-testid'?: string;
}

/**
 * 移动端瑞士轮最终结果组件
 * 垂直列表方式显示，每行：队标 + 队名 + 积分
 */
const SwissFinalResultMobile: React.FC<SwissFinalResultMobileProps> = ({
  qualifiedTeams,
  eliminatedTeams,
  rankings,
  className = '',
  'data-testid': testId = 'swiss-final-result-mobile',
}) => {
  // 固定8个晋级槽位
  const qualifiedSlots = [0, 1, 2, 3, 4, 5, 6, 7];
  // 固定8个淘汰槽位
  const eliminatedSlots = [0, 1, 2, 3, 4, 5, 6, 7];

  // 根据rankings获取队伍战绩
  const getTeamRecord = (teamId: string): string | null => {
    if (!rankings) return null;
    const ranking = rankings.find(r => r.teamId === teamId);
    return ranking?.record || null;
  };

  // 按rank排序晋级队伍
  const sortedQualifiedTeams = useMemo(() => {
    if (!rankings) return qualifiedTeams;
    return [...qualifiedTeams].sort((a, b) => {
      const rankA = rankings.find(r => r.teamId === a.id)?.rank ?? 999;
      const rankB = rankings.find(r => r.teamId === b.id)?.rank ?? 999;
      return rankA - rankB;
    });
  }, [qualifiedTeams, rankings]);

  // 按rank排序淘汰队伍
  const sortedEliminatedTeams = useMemo(() => {
    if (!rankings) return eliminatedTeams;
    return [...eliminatedTeams].sort((a, b) => {
      const rankA = rankings.find(r => r.teamId === a.id)?.rank ?? 999;
      const rankB = rankings.find(r => r.teamId === b.id)?.rank ?? 999;
      return rankA - rankB;
    });
  }, [eliminatedTeams, rankings]);

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* 晋级队伍区域 */}
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
        {/* 标题栏 */}
        <div className="bg-blue-600/80 py-2.5 px-4">
          <h3 className="text-white font-bold text-center">晋级队伍</h3>
        </div>

        {/* 垂直列表 */}
        <div className="divide-y divide-gray-700/50">
          {qualifiedSlots.map(slotIndex => {
            const team = sortedQualifiedTeams[slotIndex];
            const record = team ? getTeamRecord(team.id) : null;

            return (
              <div
                key={`qualified-${slotIndex}`}
                className="flex items-center justify-between py-3 px-4"
                data-testid={`${testId}-qualified-row-${slotIndex}`}
              >
                {/* 左侧：队标 + 队名 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {team ? (
                    <>
                      <SwissTeamLogo team={team} size={36} />
                      <span className="text-white font-medium text-sm truncate">{team.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs">?</span>
                      </div>
                      <span className="text-gray-500 text-sm">待定</span>
                    </>
                  )}
                </div>

                {/* 右侧：积分 */}
                <div className="flex-shrink-0 ml-4">
                  <span className="text-blue-400 font-bold text-lg">
                    {team ? record || '?' : '?'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 淘汰队伍区域 */}
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden border border-red-500/30">
        {/* 标题栏 */}
        <div className="bg-red-600/80 py-2.5 px-4">
          <h3 className="text-white font-bold text-center">淘汰队伍</h3>
        </div>

        {/* 垂直列表 */}
        <div className="divide-y divide-gray-700/50">
          {eliminatedSlots.map(slotIndex => {
            const team = sortedEliminatedTeams[slotIndex];
            const record = team ? getTeamRecord(team.id) : null;

            return (
              <div
                key={`eliminated-${slotIndex}`}
                className="flex items-center justify-between py-3 px-4"
                data-testid={`${testId}-eliminated-row-${slotIndex}`}
              >
                {/* 左侧：队标 + 队名 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {team ? (
                    <>
                      <SwissTeamLogo team={team} size={36} />
                      <span className="text-white font-medium text-sm truncate">{team.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 text-xs">?</span>
                      </div>
                      <span className="text-gray-500 text-sm">待定</span>
                    </>
                  )}
                </div>

                {/* 右侧：积分 */}
                <div className="flex-shrink-0 ml-4">
                  <span className="text-red-400 font-bold text-lg">
                    {team ? record || '?' : '?'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SwissFinalResultMobile;
