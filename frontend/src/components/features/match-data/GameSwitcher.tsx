import React from 'react';
import type { GameSummary } from '@/types/matchData';

interface GameSwitcherProps {
  games: GameSummary[];
  currentGame: number;
  onChange: (gameNumber: number) => void;
  isBO1?: boolean;
}

const GameSwitcher: React.FC<GameSwitcherProps> = ({
  games,
  currentGame,
  onChange,
  isBO1 = false,
}) => {
  if (isBO1 || games.length <= 1) {
    return null;
  }

  return (
    <div className="bg-[#181818] border-b border-[#505050] max-w-5xl mx-auto mt-6">
      <div className="flex">
        {games.map(game => {
          const isActive = game.gameNumber === currentGame;
          const isDisabled = !game.hasData;

          return (
            <button
              key={game.gameNumber}
              onClick={() => !isDisabled && onChange(game.gameNumber)}
              disabled={isDisabled}
              className={`
                px-6 py-4 text-base border-t-[3px] transition-all duration-200
                ${
                  isActive
                    ? 'text-[#c49f58] font-bold border-t-[#c49f58] bg-[#2d2d2d]'
                    : 'text-[#727272] border-t-transparent hover:text-[#c49f58] hover:bg-[#2d2d2d]'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              第 {game.gameNumber} 局
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameSwitcher;
