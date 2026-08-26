import React, { useState } from 'react';
import { Match, Team } from '@/types';
import SwissRoundTree from './SwissRoundTree';
import type { SwissColumnConfig, SwissViewConfig } from '@/lib/format';

interface SwissStagePCProps {
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

const SwissStagePC: React.FC<SwissStagePCProps> = ({
  matches,
  teams,
  columns,
  viewConfig,
  advancement,
  onMatchClick,
  className = '',
  'data-testid': testId = 'swiss-stage-pc',
}) => {
  const [activeTab, setActiveTab] = useState<'bo1' | 'bo3'>('bo1');

  return (
    <div className={className} data-testid={testId}>
      <SwissRoundTree
        matches={matches}
        teams={teams}
        columns={columns}
        viewConfig={viewConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        advancement={advancement}
        onMatchClick={onMatchClick}
      />
    </div>
  );
};

export default SwissStagePC;
