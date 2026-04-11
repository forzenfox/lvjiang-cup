import React from 'react';
import { Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';

interface TeamResult {
  team: Team;
  record: string;
}

interface SwissFinalResultMobileProps {
  qualifiedTeams: Team[];
  eliminatedTeams: Team[];
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
  className = '',
  'data-testid': testId = 'swiss-final-result-mobile',
}) => {
  // 固定8个晋级槽位
  const qualifiedSlots = [0, 1, 2, 3];
  // 固定8个淘汰槽位
  const eliminatedSlots = [0, 1, 2, 3, 4, 5, 6, 7];

  // 晋级记录：3-0, 3-1, 3-2 各晋级1队
  const qualifiedRecords = ['3-0', '3-1', '3-2', '3-0'];
  // 淘汰记录：0-3, 1-3, 2-3 各淘汰若干队
  const eliminatedRecords = ['0-3', '0-3', '1-3', '1-3', '2-3', '2-3', '0-3', '1-3'];

  return (
    <div className={`space-y-6 ${className}`} data-testid={testId}>
      {/* 晋级队伍区域 */}
      <div className="bg-[#1a1a2e] rounded-lg overflow-hidden border border-blue-500/30">
        {/* 标题栏 */}
        <div className="bg-blue-600/80 py-2.5 px-4">
          <h3 className="text-white font-bold text-center">晋级队伍</h3>
        </div>
        
        {/* 垂直列表 */}
        <div className="divide-y divide-gray-700/50">
          {qualifiedSlots.map((slotIndex) => {
            const team = qualifiedTeams[slotIndex];
            const record = qualifiedRecords[slotIndex];
            
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
                      <span className="text-white font-medium text-sm truncate">
                        {team.name}
                      </span>
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
                    {team ? record : '?'}
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
          {eliminatedSlots.map((slotIndex) => {
            const team = eliminatedTeams[slotIndex];
            const record = eliminatedRecords[slotIndex];
            
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
                      <span className="text-white font-medium text-sm truncate">
                        {team.name}
                      </span>
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
                    {team ? record : '?'}
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
