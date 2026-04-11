import React from 'react';

interface SwissEmptyStateProps {
  message?: string;
  className?: string;
  'data-testid'?: string;
}

const SwissEmptyState: React.FC<SwissEmptyStateProps> = ({
  message = '暂无比赛数据',
  className = '',
  'data-testid': testId = 'swiss-empty-state',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-20 px-4 ${className}`}
      data-testid={testId}
    >
      <div className="text-gray-400 text-lg mb-2" data-testid={`${testId}-icon`}>
        📅
      </div>
      <p
        className="text-gray-400 text-center"
        data-testid={`${testId}-message`}
      >
        {message}
      </p>
    </div>
  );
};

export default SwissEmptyState;