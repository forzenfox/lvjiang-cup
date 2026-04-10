import React from 'react';
import { SWISS_THEME } from '@/constants/swissTheme';

interface SwissPromotionLineProps {
  // 连接线路径
  paths: Array<{
    id: string;
    d: string;
    highlighted?: boolean;
  }>;
  className?: string;
  'data-testid'?: string;
}

const SwissPromotionLine: React.FC<SwissPromotionLineProps> = ({
  paths,
  className = '',
  'data-testid': testId = 'swiss-promotion-line',
}) => {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      data-testid={testId}
    >
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={path.highlighted ? SWISS_THEME.winner : SWISS_THEME.border}
          strokeWidth={path.highlighted ? 3 : 2}
          opacity={path.highlighted ? 1 : 0.6}
        />
      ))}
    </svg>
  );
};

export default SwissPromotionLine;
