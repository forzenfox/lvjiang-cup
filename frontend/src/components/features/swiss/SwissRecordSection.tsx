import React from 'react';
import { Match, Team } from '@/types';
import SwissMatchCard from './SwissMatchCard';
import SwissTeamLogo from './SwissTeamLogo';
import { SWISS_THEME } from '@/constants/swissTheme';
import type { SwissRecordConfig } from '@/constants/swissTreeConfig';

interface SwissRecordSectionProps {
  config: SwissRecordConfig;
  matches: Match[];
  teams: Team[];
  promotionTeams?: Team[];
  eliminationTeams?: Team[];
  onMatchClick?: (match: Match) => void;
  onPositionChange?: (slotId: string, x: number, y: number) => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  _baseX?: number;
  _baseY?: number;
  className?: string;
  'data-testid'?: string;
}

const SwissRecordSection: React.FC<SwissRecordSectionProps> = ({
  config,
  matches,
  teams,
  promotionTeams,
  eliminationTeams,
  onMatchClick,
  onPositionChange,
  containerRef,
  _baseX = 0,
  _baseY = 0,
  className = '',
  'data-testid': testId = 'swiss-record-section',
}) => {
  const { record, label, type } = config;

  // 晋级名单区域
  if (type === 'promotion') {
    return (
      <div
        className={`flex flex-col overflow-hidden ${className}`}
        style={{
          border: `2px solid ${SWISS_THEME.qualified.border}`,
        }}
        data-testid={testId}
        data-record={record}
        data-type="promotion"
      >
        {/* 标题栏 */}
        <div
          className="flex items-center justify-center px-3"
          style={{
            backgroundColor: SWISS_THEME.qualified.bg,
            height: `${SWISS_THEME.headerHeight}px`,
            borderBottom: '2px solid rgb(131, 133, 139)',
          }}
        >
          <span
            className="font-bold text-center"
            style={{
              color: SWISS_THEME.textDefault,
              fontSize: `${SWISS_THEME.titleFontSize}px`,
            }}
          >
            晋级
          </span>
        </div>

        {/* 队伍列表 */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 p-3"
          style={{
            backgroundColor: SWISS_THEME.qualified.contentBg,
            minHeight: '60px',
          }}
        >
          {promotionTeams?.map((team, _index) => (
            <div
              key={team.id}
              className="flex flex-col items-center gap-1"
              style={{ width: '50px' }}
            >
              <SwissTeamLogo team={team} size={40} />
              <span
                className="text-center truncate w-full"
                style={{ color: SWISS_THEME.textMuted, fontSize: '10px' }}
              >
                {team.name}
              </span>
            </div>
          ))}
          {(!promotionTeams || promotionTeams.length === 0) && (
            <div
              className="flex flex-col items-center justify-center gap-2 w-full py-4"
              style={{
                border: '2px dashed #3d8fe8',
                borderRadius: '8px',
                backgroundColor: 'rgba(30, 93, 200, 0.08)',
              }}
            >
              <span style={{ color: '#8ba4c7', fontSize: '13px' }}>
                暂无可展示的队伍
              </span>
              <span style={{ color: '#6b7a8f', fontSize: '11px' }}>
                当前轮次暂无晋级队伍
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 淘汰名单区域
  if (type === 'elimination') {
    return (
      <div
        className={`flex flex-col overflow-hidden ${className}`}
        style={{
          border: `2px solid ${SWISS_THEME.eliminated.border}`,
        }}
        data-testid={testId}
        data-record={record}
        data-type="elimination"
      >
        {/* 标题栏 */}
        <div
          className="flex items-center justify-center px-3"
          style={{
            backgroundColor: SWISS_THEME.eliminated.bg,
            height: `${SWISS_THEME.headerHeight}px`,
            borderBottom: '2px solid rgb(18, 19, 18)',
          }}
        >
          <span
            className="font-bold text-center"
            style={{
              color: SWISS_THEME.textDefault,
              fontSize: `${SWISS_THEME.titleFontSize}px`,
            }}
          >
            淘汰
          </span>
        </div>

        {/* 队伍列表 */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 p-3"
          style={{
            backgroundColor: SWISS_THEME.eliminated.contentBg,
            minHeight: '60px',
          }}
        >
          {eliminationTeams?.map((team, _index) => (
            <div
              key={team.id}
              className="flex flex-col items-center gap-1"
              style={{ width: '50px' }}
            >
              <SwissTeamLogo team={team} size={40} />
              <span
                className="text-center truncate w-full"
                style={{ color: SWISS_THEME.textMuted, fontSize: '10px' }}
              >
                {team.name}
              </span>
            </div>
          ))}
          {(!eliminationTeams || eliminationTeams.length === 0) && (
            <div
              className="flex flex-col items-center justify-center gap-2 w-full py-4"
              style={{
                border: '2px dashed #a05050',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 69, 69, 0.08)',
              }}
            >
              <span style={{ color: '#8ba4c7', fontSize: '13px' }}>
                暂无可展示的队伍
              </span>
              <span style={{ color: '#6b7a8f', fontSize: '11px' }}>
                当前轮次暂无淘汰队伍
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 比赛区域
  return (
    <div
      className={`flex flex-col ${className}`}
      data-testid={testId}
      data-record={record}
      data-type="matches"
    >
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          backgroundColor: SWISS_THEME.titleBg,
          height: `${SWISS_THEME.headerHeight}px`,
          borderBottom: `4px solid ${SWISS_THEME.titleBorder}`,
        }}
      >
        <span
          style={{
            color: SWISS_THEME.titleText,
            fontSize: `${SWISS_THEME.titleFontSize}px`,
          }}
        >
          {label}
        </span>
      </div>

      {/* 比赛列表 */}
      <div className="flex flex-col">
        {matches.map((match, index) => (
          <SwissMatchCard
            key={match.id}
            match={match}
            teams={teams}
            onClick={onMatchClick ? () => onMatchClick(match) : undefined}
            slotId={config.slotIds[index]}
            onPositionChange={onPositionChange}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
};

export default SwissRecordSection;
