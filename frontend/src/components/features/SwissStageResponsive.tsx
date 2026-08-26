import React from 'react';
import { Match, Team } from '@/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import SwissStagePC from './swiss/SwissStagePC';
import SwissStageMobile from './swiss/SwissStageMobile';
import type { SwissColumnConfig, SwissViewConfig } from '@/lib/format';

interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  /** 轮次列视图模型（来自 buildSwissColumns，由父组件按生效配置推导） */
  columns: SwissColumnConfig[];
  /** BO1/BO3 快捷视图配置（来自 getSwissViewConfig） */
  viewConfig: SwissViewConfig;
  advancement?: {
    top8: string[];
    eliminated: string[];
    rankings?: { teamId: string; record: string; rank: number }[];
  };
  onMatchClick?: (match: Match) => void;
  className?: string;
  'data-testid'?: string;
}

const SwissStage: React.FC<SwissStageProps> = ({
  matches,
  teams,
  columns,
  viewConfig,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-stage',
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SwissStageMobile
        matches={matches}
        teams={teams}
        columns={columns}
        advancement={advancement}
        onMatchClick={onMatchClick}
        className={className}
        data-testid={`${testId}-mobile`}
      />
    );
  }

  return (
    <SwissStagePC
      matches={matches}
      teams={teams}
      columns={columns}
      viewConfig={viewConfig}
      advancement={advancement}
      onMatchClick={onMatchClick}
      className={className}
      data-testid={`${testId}-pc`}
    />
  );
};

export default SwissStage;
