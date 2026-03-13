import React from 'react';
import { Match, Team } from '@/types';
import BracketMatchCard from './BracketMatchCard';
import EditableBracketMatchCard from './EditableBracketMatchCard';
import EliminationConnectors from './EliminationConnectors';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  ELIMINATION_POSITIONS,
  createPlaceholderMatch,
} from './eliminationConstants';

interface EliminationStageProps {
  matches: Match[];
  teams: Team[];
  editable?: boolean;
  onMatchUpdate?: (match: Match) => void;
}

// 淘汰赛比赛编号到真实ID的映射（与后端初始化槽位一致）
const GAME_NUMBER_TO_ID: Record<number, string> = {
  1: 'elim-winners-1',
  2: 'elim-winners-2',
  3: 'elim-losers-3',
  4: 'elim-losers-4',
  5: 'elim-winners-5',
  6: 'elim-losers-6',
  7: 'elim-losers-7',
  8: 'elim-grand-8',
};

const EliminationStage: React.FC<EliminationStageProps> = ({
  matches,
  teams,
  editable = false,
  onMatchUpdate,
}) => {
  // Helper to find match by game number
  const getMatch = (gameNum: number) => matches.find(m => m.eliminationGameNumber === gameNum);

  const renderMatch = (match: Match | undefined, pos: { x: number; y: number }, gameNum?: number) => {
    // 对于可编辑模式，如果比赛不存在，使用真实ID创建占位比赛
    let displayMatch: Match;
    if (match) {
      displayMatch = match;
    } else if (editable && gameNum && GAME_NUMBER_TO_ID[gameNum]) {
      // 使用真实ID创建占位比赛，而不是 placeholder-xxx
      displayMatch = {
        ...createPlaceholderMatch(gameNum),
        id: GAME_NUMBER_TO_ID[gameNum],
      };
    } else {
      displayMatch = createPlaceholderMatch(gameNum);
    }

    return (
      <div
        className="absolute"
        style={{ left: pos.x, top: pos.y }}
      >
        {editable && onMatchUpdate ? (
          <EditableBracketMatchCard
            match={displayMatch}
            teams={teams}
            onUpdate={onMatchUpdate}
          />
        ) : (
          <BracketMatchCard
            match={displayMatch}
            teams={teams}
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-x-auto min-h-[700px] bg-gray-900/20 rounded-xl p-8">
      <div
        className="relative"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT, minWidth: BOARD_WIDTH }}
      >
        {/* 连接线层（在比赛卡片下方） */}
        <EliminationConnectors />

        {/* 比赛卡片层 */}
        {renderMatch(getMatch(1), ELIMINATION_POSITIONS.g1, 1)}
        {renderMatch(getMatch(2), ELIMINATION_POSITIONS.g2, 2)}
        {renderMatch(getMatch(3), ELIMINATION_POSITIONS.g3, 3)}
        {renderMatch(getMatch(4), ELIMINATION_POSITIONS.g4, 4)}
        {renderMatch(getMatch(5), ELIMINATION_POSITIONS.g5, 5)}
        {renderMatch(getMatch(6), ELIMINATION_POSITIONS.g6, 6)}
        {renderMatch(getMatch(7), ELIMINATION_POSITIONS.g7, 7)}
        {renderMatch(getMatch(8), ELIMINATION_POSITIONS.g8, 8)}
      </div>
    </div>
  );
};

export default EliminationStage;
