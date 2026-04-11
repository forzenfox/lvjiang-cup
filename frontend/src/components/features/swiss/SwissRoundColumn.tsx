import React from 'react';
import { Match, Team } from '@/types';
import SwissMatchCard from './SwissMatchCard';
import { SWISS_THEME } from '@/constants/swissTheme';
import { getRoundFormat } from '@/pages/admin/swissRoundSlots';

interface SwissRoundColumnProps {
  title: string;
  record: string;
  matches: Match[];
  teams: Team[];
  onMatchClick?: (match: Match) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissRoundColumn: React.FC<SwissRoundColumnProps> = ({
  title,
  record,
  matches,
  teams,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-round-column',
}) => {
  return (
    <div
      className={`flex flex-col flex-shrink-0 ${className}`}
      style={{ 
        width: `${SWISS_THEME.columnWidth}px`,
        minWidth: `${SWISS_THEME.columnWidth}px`,
      }}
      data-testid={testId}
      data-record={record}
    >
      {/* 标题栏 - 官方 LPL 风格 */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          backgroundColor: SWISS_THEME.titleBg,
          height: `${SWISS_THEME.headerHeight}px`,
          borderBottom: `4px solid ${SWISS_THEME.titleBorder}`,
        }}
        data-testid={`${testId}-header`}
      >
        <span
          style={{
            color: SWISS_THEME.titleText,
            fontSize: `${SWISS_THEME.titleFontSize}px`,
          }}
        >
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{
              color: SWISS_THEME.titleText,
              fontSize: `${SWISS_THEME.titleFontSize}px`,
            }}
          >
            {record}
          </span>
          <span
            style={{
              color: SWISS_THEME.titleText,
              fontSize: `${SWISS_THEME.titleFontSize}px`,
            }}
          >
            {getRoundFormat(record)}
          </span>
        </div>
      </div>

      {/* 比赛列表 */}
      <div
        className="flex flex-col"
        data-testid={`${testId}-matches`}
      >
        {matches.map((match, index) => (
          <SwissMatchCard
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
};

export default SwissRoundColumn;
