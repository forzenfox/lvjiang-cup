import React, { useRef, useEffect, useState } from 'react';
import { Match, Team } from '@/types';
import SwissTeamLogo from './SwissTeamLogo';
import { SWISS_THEME } from '@/constants/swissTheme';
import MatchDetailModal from '@/components/features/MatchDetailModal';

interface SwissMatchCardProps {
  match: Match;
  teams: Team[];
  onClick?: () => void;
  onPositionChange?: (slotId: string, x: number, y: number) => void;
  slotId?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  'data-testid'?: string;
}

const SwissMatchCard: React.FC<SwissMatchCardProps> = ({
  match,
  teams,
  onClick,
  onPositionChange,
  slotId,
  containerRef,
  className = '',
  'data-testid': testId = 'swiss-match-card',
}) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';
  const cardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTeamAWinner = isFinished && match.winnerId === match.teamAId;
  const isTeamBWinner = isFinished && match.winnerId === match.teamBId;

  useEffect(() => {
    if (onPositionChange && slotId && cardRef.current) {
      // 使用requestAnimationFrame确保DOM已完全更新
      const updatePosition = () => {
        if (!cardRef.current || !onPositionChange) return;

        const cardRect = cardRef.current.getBoundingClientRect();
        let x = cardRect.left;
        let y = cardRect.top;

        if (containerRef?.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          x = cardRect.left - containerRect.left;
          y = cardRect.top - containerRect.top;
        } else if (cardRef.current.offsetParent) {
          const parentRect = cardRef.current.offsetParent.getBoundingClientRect();
          x = cardRect.left - parentRect.left;
          y = cardRect.top - parentRect.top;
        }

        onPositionChange(slotId, x, y);
      };

      // 延迟一点时间确保父容器已渲染
      const timeoutId = setTimeout(updatePosition, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [onPositionChange, slotId, containerRef]);

  const handleCardClick = () => {
    setIsModalOpen(true);
    onClick?.();
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`flex items-center justify-center px-3 py-2 relative cursor-pointer hover:opacity-90 ${className}`}
        style={{
          backgroundColor: SWISS_THEME.matchBg,
          height: `${SWISS_THEME.matchCardHeight}px`,
        }}
        onClick={handleCardClick}
        data-testid={testId}
        data-slot-id={slotId}
      >
        {/* 底部分隔线 */}
        <div
          className="absolute bottom-0 left-[5%] right-[5%] h-[1px]"
          style={{ backgroundColor: SWISS_THEME.matchBorder }}
        />

        {/* 左侧队伍 - 靠左对齐 */}
        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-start', flex: 1 }}>
          <SwissTeamLogo team={teamA} size={SWISS_THEME.teamLogoSize} />
          <span
            className="font-medium truncate"
            style={{
              fontSize: `${SWISS_THEME.teamNameFontSize}px`,
              color: isTeamAWinner ? SWISS_THEME.winnerText : SWISS_THEME.loserText,
              maxWidth: '70px',
            }}
            data-testid={`${testId}-team-a-name`}
          >
            {teamA?.name || '待定'}
          </span>
        </div>

        {/* 比分 - 居中 */}
        <div
          className="flex items-center justify-center"
          style={{
            fontFamily: 'dinbold, sans-serif',
            fontWeight: 'bold',
            minWidth: '50px',
          }}
        >
          <span
            style={{
              fontSize: `${SWISS_THEME.scoreFontSize}px`,
              color: isTeamAWinner ? SWISS_THEME.scoreActive : SWISS_THEME.scoreDefault,
            }}
            data-testid={`${testId}-score-a`}
          >
            {match.scoreA ?? '0'}
          </span>
          <span
            className="mx-1"
            style={{
              fontSize: `${SWISS_THEME.scoreFontSize}px`,
              color: SWISS_THEME.scoreDefault,
              transform: 'translateY(-2px)',
            }}
          >
            :
          </span>
          <span
            style={{
              fontSize: `${SWISS_THEME.scoreFontSize}px`,
              color: isTeamBWinner ? SWISS_THEME.scoreActive : SWISS_THEME.scoreDefault,
            }}
            data-testid={`${testId}-score-b`}
          >
            {match.scoreB ?? '0'}
          </span>
        </div>

        {/* 右侧队伍 - 靠右对齐 */}
        <div className="flex items-center gap-1" style={{ justifyContent: 'flex-end', flex: 1 }}>
          <span
            className="font-medium truncate text-right"
            style={{
              fontSize: `${SWISS_THEME.teamNameFontSize}px`,
              color: isTeamBWinner ? SWISS_THEME.winnerText : SWISS_THEME.loserText,
              maxWidth: '70px',
            }}
            data-testid={`${testId}-team-b-name`}
          >
            {teamB?.name || '待定'}
          </span>
          <SwissTeamLogo team={teamB} size={SWISS_THEME.teamLogoSize} />
        </div>
      </div>

      {/* 对战详情弹框 */}
      <MatchDetailModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={match}
        teams={teams}
      />
    </>
  );
};

export default SwissMatchCard;
