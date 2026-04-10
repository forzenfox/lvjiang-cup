import React from 'react';
import { SWISS_STAGE_CONFIG } from '@/constants/swissStageConfig';

interface SwissRoundTabsProps {
  selectedRound: number;
  onRoundChange: (round: number) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissRoundTabs: React.FC<SwissRoundTabsProps> = ({
  selectedRound,
  onRoundChange,
  className = '',
  'data-testid': testId = 'swiss-round-tabs',
}) => {
  const rounds = SWISS_STAGE_CONFIG.rounds;

  return (
    <div
      className={`flex overflow-x-auto gap-2 pb-2 scrollbar-hide ${className}`}
      data-testid={testId}
    >
      {rounds.map((round) => (
        <button
          key={round.round}
          onClick={() => onRoundChange(round.round)}
          className={`px-4 py-2 rounded-t text-sm font-medium whitespace-nowrap transition-colors ${
            selectedRound === round.round
              ? 'bg-[#1E3A8A] text-white border-b-2 border-[#F59E0B]'
              : 'bg-transparent text-gray-400 hover:bg-gray-800/30'
          }`}
          data-testid={`${testId}-tab-${round.round}`}
          data-selected={selectedRound === round.round}
        >
          {round.label}
        </button>
      ))}
    </div>
  );
};

export default SwissRoundTabs;