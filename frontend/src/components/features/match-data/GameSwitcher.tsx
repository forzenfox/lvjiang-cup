import React from 'react';
import { Swords } from 'lucide-react';
import type { GameSummary } from '@/types/matchData';

interface GameSwitcherProps {
  games: GameSummary[];
  currentGame: number;
  onChange: (gameNumber: number) => void;
  format?: string;
}

/**
 * 对局切换器组件
 * 参考LPL官方页面设计，与TeamStatsBar视觉上连在一起
 * BO1: 显示"第一场"标签（不可切换），增加视觉丰富度
 * BO3/BO5: 显示"第一场"、"第二场"等，支持点击切换
 */
const GameSwitcher: React.FC<GameSwitcherProps> = ({
  games,
  currentGame,
  onChange,
  format = 'BO3',
}) => {
  // 获取要显示的场次列表
  const getDisplayGames = (): GameSummary[] => {
    // 对于BO1，只显示第一场
    if (format === 'BO1') {
      return games.filter(g => g.gameNumber === 1);
    }
    // 对于BO3/BO5，显示所有场次
    return games;
  };

  const displayGames = getDisplayGames();
  const isBO1 = format === 'BO1';

  // BO1 显示增强版标签区域，增加视觉丰富度
  if (isBO1) {
    return (
      <div className="bg-[#181818] border-b border-[#2d2d2d] max-w-5xl mx-auto mt-4 rounded-t-xl overflow-hidden">
        <div className="flex items-center">
          <div className="relative flex items-center gap-2 px-8 py-4 text-base font-bold text-[#c49f58] bg-[#2d2d2d]">
            <span className="absolute top-0 left-0 right-0 h-[3px] bg-[#c49f58]" />
            <Swords className="w-5 h-5" />
            <span>第一场</span>
            <span className="ml-2 text-xs font-normal text-gray-400 bg-[#1a1a1a] px-2 py-0.5 rounded-full">
              BO1
            </span>
          </div>
          <div className="flex-1 px-6 py-4 text-sm text-gray-500">单局决胜</div>
        </div>
      </div>
    );
  }

  // 多局比赛显示可切换的tab，页签平均分配横向空间
  return (
    <div className="bg-[#181818] border-b-0 max-w-5xl mx-auto mt-4 rounded-t-xl overflow-hidden">
      <div className="flex">
        {displayGames.map(game => {
          const isActive = game.gameNumber === currentGame;
          const isDisabled = !game.hasData;
          // 中文数字映射
          const chineseNumbers = ['一', '二', '三', '四', '五'];
          const gameLabel = `第${chineseNumbers[game.gameNumber - 1] || game.gameNumber}场`;

          return (
            <button
              key={game.gameNumber}
              onClick={() => !isDisabled && onChange(game.gameNumber)}
              disabled={isDisabled}
              className={`
                relative flex-1 py-4 text-base font-medium transition-all duration-200
                ${
                  isActive
                    ? 'text-[#c49f58] bg-[#2d2d2d]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]/50'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* 顶部高亮条 */}
              <span
                className={`
                  absolute top-0 left-0 right-0 h-[2px] transition-all duration-200
                  ${isActive ? 'bg-[#c49f58]' : 'bg-transparent'}
                `}
              />
              {gameLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameSwitcher;
