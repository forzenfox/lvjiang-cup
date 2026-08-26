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
  createPlaceholderMatch,
} from './eliminationConstants';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';
import type { EliminationGame, EliminationViewModel } from '@/lib/format';

interface EliminationStageProps {
  matches: Match[];
  teams: Team[];
  /** 淘汰赛视图模型（来自 buildEliminationStages，由父组件按生效配置推导） */
  viewModel: EliminationViewModel;
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
  onMatchClick?: (match: Match) => void;
}

/**
 * 推导比赛槽位 wrapper 的 data-testid（如 elimination-match-qf1）
 * levels <= 3 时保持与旧固定三级结构一致的 qf/sf/f 命名（决赛无序号，E2E 兼容）；
 * 更多层级时改用 r{level}-{index} 命名避免短 key 重复。
 */
const matchSlotTestId = (game: EliminationGame, levels: number): string => {
  if (levels > 3) {
    return `elimination-match-r${game.level}-${game.indexInLevel}`;
  }
  if (game.level === levels - 1) {
    return 'elimination-match-f';
  }
  const shortKey = game.level === 0 ? 'qf' : 'sf';
  return `elimination-match-${shortKey}${game.indexInLevel}`;
};

/**
 * 根据层级推导阶段全称（用于卡片 data-testid，如 elim-match-card-quarterfinals-1）
 * 末级为 finals、倒数第二级为 semifinals、其余为 quarterfinals
 */
const stageBracketName = (level: number, levels: number): string => {
  if (level === levels - 1) return 'finals';
  if (level === levels - 2) return 'semifinals';
  return 'quarterfinals';
};

const EliminationStage: React.FC<EliminationStageProps> = ({
  matches,
  teams,
  viewModel,
  editable = false,
  onMatchUpdate,
  onMatchClick,
}) => {
  const { levels, stages, games, connectors } = viewModel;
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

  // 根据容器宽度与视图模型层级计算位置
  const positions = useMemo(() => {
    return calculateEliminationPositions(
      containerWidth,
      levels,
      stages.map(stage => stage.matchCount)
    );
  }, [containerWidth, levels, stages]);

  // 计算阶段标签的位置（与卡片左对齐）
  const getStageLabelX = (colIndex: number) => {
    const colWidth = containerWidth / levels;
    return colIndex * colWidth + (colWidth - CARD_WIDTH) / 2;
  };

  const getMatch = (gameNum: number) => matches.find(m => m.eliminationGameNumber === gameNum);

  // 渲染单场比赛卡片：优先真实比赛数据，缺失时生成占位（仅用于展示，保存需真实 match id）
  const renderMatch = (game: EliminationGame) => {
    const match = getMatch(game.gameNumber);
    const displayMatch: Match = match ?? createPlaceholderMatch(game.gameNumber);

    const bracket = stageBracketName(game.level, levels);
    const testId = `elim-match-card-${bracket}-${game.indexInLevel}`;

    const gamePos = positions[game.key] || { x: 0, y: 0 };

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
          <EditableBracketMatchCard
            match={displayMatch}
            teams={teams}
            onUpdate={onMatchUpdate}
            allMatches={matches}
          />
        ) : (
          <BracketMatchCard
            match={displayMatch}
            teams={teams}
            testId={testId}
            onMatchClick={onMatchClick}
          />
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
        <EliminationConnectors
          connectors={connectors}
          positions={positions}
          containerWidth={containerWidth}
        />

        {/* 阶段标签 - 官方UI风格：宽度与卡片一致，顶部对齐 */}
        {stages.map(stage => (
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

        {/* 比赛卡片：按视图模型逐场渲染 */}
        {games.map(game => (
          <div key={game.key} data-testid={matchSlotTestId(game, levels)}>
            {renderMatch(game)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EliminationStage;
