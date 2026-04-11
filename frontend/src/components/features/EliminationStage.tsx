import React from 'react';
import { Match, Team } from '@/types';
import BracketMatchCard from './BracketMatchCard';
import EditableBracketMatchCard from './EditableBracketMatchCard';
import EliminationConnectors from './EliminationConnectors';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  ELIMINATION_POSITIONS,
  ELIMINATION_STAGES,
  createPlaceholderMatch,
  ELIMINATION_BO_FORMAT,
} from './eliminationConstants';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';
import { format } from 'date-fns';

interface EliminationStageProps {
  matches: Match[];
  teams: Team[];
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
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

// 淘汰赛比赛编号到 bracket 和 index 的映射（8队单败：4QF + 2SF + 1F）
const GAME_NUMBER_TO_BRACKET_INDEX: Record<number, { bracket: string; index: number }> = {
  1: { bracket: 'quarterfinals', index: 1 },
  2: { bracket: 'quarterfinals', index: 2 },
  3: { bracket: 'quarterfinals', index: 3 },
  4: { bracket: 'quarterfinals', index: 4 },
  5: { bracket: 'semifinals', index: 1 },
  6: { bracket: 'semifinals', index: 2 },
  7: { bracket: 'finals', index: 1 },
};

const EliminationStage: React.FC<EliminationStageProps> = ({
  matches,
  teams,
  editable = false,
  onMatchUpdate,
}) => {
  const getMatch = (gameNum: number) => matches.find(m => m.eliminationGameNumber === gameNum);

  const formatMatchTime = (startTime: string | undefined): string => {
    if (!startTime) return '待定';
    try {
      return format(new Date(startTime), 'MM月dd日 HH:mm');
    } catch {
      return '待定';
    }
  };

  const renderMatch = (
    match: Match | undefined,
    pos: { x: number; y: number },
    gameNum?: number
  ) => {
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

    const bracketInfo = gameNum ? GAME_NUMBER_TO_BRACKET_INDEX[gameNum] : null;
    const testId = bracketInfo
      ? `elim-match-card-${bracketInfo.bracket}-${bracketInfo.index}`
      : 'bracket-match';

    return (
      <div className="absolute" style={{ left: pos.x, top: pos.y }}>
        {/* 时间显示在卡片上方 */}
        <div
          className="text-xs text-center mb-1 whitespace-nowrap"
          style={{ color: ELIMINATION_THEME.loserText, width: ELIMINATION_THEME.cardWidth }}
        >
          {formatMatchTime(displayMatch.startTime)}
        </div>
        {editable && onMatchUpdate ? (
          <EditableBracketMatchCard match={displayMatch} teams={teams} onUpdate={onMatchUpdate} />
        ) : (
          <BracketMatchCard match={displayMatch} teams={teams} testId={testId} />
        )}
      </div>
    );
  };

  return (
    <div
      className="relative w-full overflow-x-auto"
      style={{ minHeight: `${BOARD_HEIGHT + 100}px` }}
      data-testid="elimination-stage"
    >
      <div
        className="relative"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, minWidth: BOARD_WIDTH }}
        data-testid="elimination-bracket"
      >
        {/* 连接线层 */}
        <EliminationConnectors />

        {/* 阶段标签 - 官方UI风格 */}
        {ELIMINATION_STAGES.map((stage) => (
          <div
            key={stage.key}
            className="absolute text-sm font-medium text-center"
            style={{
              left: stage.x,
              top: -35,
              width: ELIMINATION_THEME.cardWidth,
              color: ELIMINATION_THEME.stageLabelText,
              backgroundColor: ELIMINATION_THEME.stageLabelBg,
              padding: '6px 0',
              borderBottom: `2px solid ${ELIMINATION_THEME.stageLabelBorder}`,
            }}
          >
            {stage.name}
          </div>
        ))}

        {/* BO5 标识 */}
        <div
          className="absolute top-0 right-0 text-xs px-2 py-1 rounded"
          style={{
            color: ELIMINATION_THEME.winner,
            backgroundColor: 'rgba(200, 170, 110, 0.1)',
            border: `1px solid ${ELIMINATION_THEME.winner}`,
          }}
          data-testid="elimination-bo-format"
        >
          {ELIMINATION_BO_FORMAT}
        </div>

        {/* 四分之一决赛 */}
        <div data-testid="elimination-match-qf1">
          {renderMatch(getMatch(1), ELIMINATION_POSITIONS.qf1, 1)}
        </div>
        <div data-testid="elimination-match-qf2">
          {renderMatch(getMatch(2), ELIMINATION_POSITIONS.qf2, 2)}
        </div>
        <div data-testid="elimination-match-qf3">
          {renderMatch(getMatch(3), ELIMINATION_POSITIONS.qf3, 3)}
        </div>
        <div data-testid="elimination-match-qf4">
          {renderMatch(getMatch(4), ELIMINATION_POSITIONS.qf4, 4)}
        </div>

        {/* 半决赛 */}
        <div data-testid="elimination-match-sf1">
          {renderMatch(getMatch(5), ELIMINATION_POSITIONS.sf1, 5)}
        </div>
        <div data-testid="elimination-match-sf2">
          {renderMatch(getMatch(6), ELIMINATION_POSITIONS.sf2, 6)}
        </div>

        {/* 决赛 */}
        <div data-testid="elimination-match-f">
          {renderMatch(getMatch(7), ELIMINATION_POSITIONS.f, 7)}
        </div>
      </div>
    </div>
  );
};

export default EliminationStage;
