import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Match, Team } from '@/types';
import BracketMatchCard from './BracketMatchCard';
import EditableBracketMatchCard from './EditableBracketMatchCard';
import EliminationConnectors from './EliminationConnectors';
import {
  BOARD_HEIGHT,
  BOARD_MIN_WIDTH,
  CARD_WIDTH,
  calculateEliminationPositions,
  ELIMINATION_STAGES,
  createPlaceholderMatch,
  GAME_NUMBER_TO_STAGE,
} from './eliminationConstants';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';

interface EliminationStageProps {
  matches: Match[];
  teams: Team[];
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
  onImportClick?: (matchId: string) => void;
}

// 淘汰赛比赛编号到真实ID的映射（8队单败：4QF + 2SF + 1F）
const GAME_NUMBER_TO_ID: Record<number, string> = {
  1: 'elim-qf-1',
  2: 'elim-qf-2',
  3: 'elim-qf-3',
  4: 'elim-qf-4',
  5: 'elim-sf-1',
  6: 'elim-sf-2',
  7: 'elim-f-1',
};

const EliminationStage: React.FC<EliminationStageProps> = ({
  matches,
  teams,
  editable = false,
  onMatchUpdate,
  onImportClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // 监听容器宽度变化，实现响应式布局
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = Math.max(containerRef.current.clientWidth, BOARD_MIN_WIDTH);
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 根据容器宽度计算位置
  const positions = useMemo(() => {
    return calculateEliminationPositions(containerWidth);
  }, [containerWidth]);

  // 计算阶段标签的位置（与卡片左对齐）
  const getStageLabelX = (colIndex: number) => {
    const colWidth = containerWidth / 3;
    return colIndex * colWidth + (colWidth - CARD_WIDTH) / 2;
  };

  const getMatch = (gameNum: number) => matches.find(m => m.eliminationGameNumber === gameNum);

  const renderMatch = (match: Match | undefined, gameNum?: number) => {
    let displayMatch: Match;
    if (match) {
      displayMatch = match;
    } else if (editable && gameNum && GAME_NUMBER_TO_ID[gameNum]) {
      displayMatch = {
        ...createPlaceholderMatch(gameNum),
        id: GAME_NUMBER_TO_ID[gameNum],
      };
    } else {
      displayMatch = createPlaceholderMatch(gameNum);
    }

    const stageInfo = gameNum ? GAME_NUMBER_TO_STAGE[gameNum] : null;
    const testId = stageInfo
      ? `elim-match-card-${stageInfo.stage}-${stageInfo.index}`
      : 'bracket-match';

    // 根据游戏编号获取正确的位置
    let gameKey: string;
    if (gameNum && gameNum <= 4) {
      gameKey = `qf${gameNum}`;
    } else if (gameNum && gameNum <= 6) {
      gameKey = `sf${gameNum - 4}`;
    } else {
      gameKey = 'f';
    }
    const gamePos = positions[gameKey as keyof typeof positions] || positions['qf1'];

    return (
      <div
        className="absolute"
        style={{
          left: gamePos.x,
          top: gamePos.y,
          width: ELIMINATION_THEME.cardWidth,
        }}
      >
        {editable && onMatchUpdate ? (
          <EditableBracketMatchCard match={displayMatch} teams={teams} onUpdate={onMatchUpdate} onImportClick={onImportClick} />
        ) : (
          <BracketMatchCard match={displayMatch} teams={teams} testId={testId} />
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-x-auto"
      style={{ minHeight: `${BOARD_HEIGHT + 60}px` }}
      data-testid="elimination-stage"
    >
      <div
        className="relative"
        style={{
          width: containerWidth,
          height: BOARD_HEIGHT,
          minWidth: BOARD_MIN_WIDTH,
        }}
        data-testid="elimination-bracket"
      >
        {/* 连接线层 */}
        <EliminationConnectors positions={positions} containerWidth={containerWidth} />

        {/* 阶段标签 - 官方UI风格：宽度与卡片一致，顶部对齐 */}
        {ELIMINATION_STAGES.map(stage => (
          <div
            key={stage.key}
            className="absolute text-sm font-medium text-center flex items-center justify-center"
            style={{
              left: getStageLabelX(stage.colIndex),
              top: 10,
              width: CARD_WIDTH,
              height: '40px',
              color: ELIMINATION_THEME.stageLabelText,
              backgroundColor: ELIMINATION_THEME.stageLabelBg,
              borderRadius: '4px',
            }}
          >
            {stage.name}
          </div>
        ))}

        {/* 四分之一决赛 */}
        <div data-testid="elimination-match-qf1">{renderMatch(getMatch(1), 1)}</div>
        <div data-testid="elimination-match-qf2">{renderMatch(getMatch(2), 2)}</div>
        <div data-testid="elimination-match-qf3">{renderMatch(getMatch(3), 3)}</div>
        <div data-testid="elimination-match-qf4">{renderMatch(getMatch(4), 4)}</div>

        {/* 半决赛 */}
        <div data-testid="elimination-match-sf1">{renderMatch(getMatch(5), 5)}</div>
        <div data-testid="elimination-match-sf2">{renderMatch(getMatch(6), 6)}</div>

        {/* 决赛 */}
        <div data-testid="elimination-match-f">{renderMatch(getMatch(7), 7)}</div>
      </div>
    </div>
  );
};

export default EliminationStage;
