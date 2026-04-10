import React from 'react';
import { Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';
import { SWISS_THEME } from '@/constants/swissTheme';

interface SwissRecordGroupProps {
  type: 'qualified' | 'eliminated';
  title: string;
  teams: Team[];
  className?: string;
  'data-testid'?: string;
}

const SwissRecordGroup: React.FC<SwissRecordGroupProps> = ({
  type,
  title,
  teams,
  className = '',
  'data-testid': testId = 'swiss-record-group',
}) => {
  const config = type === 'qualified' ? SWISS_THEME.qualified : SWISS_THEME.eliminated;

  return (
    <div
      className={`flex flex-col overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: `${SWISS_THEME.columnWidth}px`,
        minWidth: `${SWISS_THEME.columnWidth}px`,
        border: `2px solid ${config.border}`,
      }}
      data-testid={testId}
      data-type={type}
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-center px-3"
        style={{
          backgroundColor: config.bg,
          height: `${SWISS_THEME.headerHeight}px`,
          borderBottom: type === 'qualified'
            ? '2px solid rgb(131, 133, 139)'
            : '2px solid rgb(18, 19, 18)',
        }}
        data-testid={`${testId}-title`}
      >
        <span
          className="font-bold text-center"
          style={{
            color: SWISS_THEME.textDefault,
            fontSize: `${SWISS_THEME.titleFontSize}px`,
          }}
        >
          {title}
        </span>
      </div>

      {/* 队伍列表 */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 p-3"
        style={{
          backgroundColor: config.contentBg,
          minHeight: '80px',
        }}
        data-testid={`${testId}-teams`}
      >
        {teams.map((team, index) => (
          <div
            key={team.id}
            className="flex flex-col items-center gap-1"
            style={{ width: '60px' }}
            data-testid={`${testId}-team-${index}`}
          >
            <SwissTeamLogo team={team} size={48} />
            <span
              className="text-xs text-center truncate w-full"
              style={{ color: SWISS_THEME.textMuted, fontSize: '11px' }}
            >
              {team.name}
            </span>
          </div>
        ))}
        {teams.length === 0 && (
          <span style={{ color: SWISS_THEME.textMuted, fontSize: '12px' }}>暂无队伍</span>
        )}
      </div>
    </div>
  );
};

export default SwissRecordGroup;
