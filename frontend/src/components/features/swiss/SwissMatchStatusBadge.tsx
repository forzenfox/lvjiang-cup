import React from 'react';
import { MatchStatus } from '@/types';

interface SwissMatchStatusBadgeProps {
  status: MatchStatus;
}

const statusStyles = {
  upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
  ongoing: 'bg-green-900/50 text-green-400 border-green-700/30 animate-pulse',
  finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
};

const statusLabels = {
  upcoming: '未开始',
  ongoing: '进行中',
  finished: '已结束',
};

const SwissMatchStatusBadge: React.FC<SwissMatchStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${statusStyles[status]}`}
      data-testid="match-status"
    >
      {statusLabels[status]}
    </span>
  );
};

export default SwissMatchStatusBadge;
