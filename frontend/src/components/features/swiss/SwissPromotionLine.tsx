import React from 'react';
import { SWISS_THEME } from '@/constants/swissTheme';
import type { SwissMatchCardPosition } from './SwissRoundTree';

export interface PromotionLineProps {
  fromCard: SwissMatchCardPosition;
  toCard: SwissMatchCardPosition;
  isWinPath: boolean;
  cardHeight: number;
  columnWidth: number;
  columnGap: number;
}

const PromotionLine: React.FC<PromotionLineProps> = ({
  fromCard,
  toCard,
  isWinPath,
  cardHeight,
  columnWidth,
  columnGap,
}) => {
  // 计算起点和终点的坐标
  const fromX = fromCard.x + columnWidth / 2;
  const fromY = fromCard.y + (isWinPath ? 0 : cardHeight);
  const toX = toCard.x + columnWidth / 2;
  const toY = toCard.y + (isWinPath ? cardHeight : 0);

  // 计算路径
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;

  const strokeColor = isWinPath ? SWISS_THEME.connector : SWISS_THEME.matchBorder;
  const strokeDasharray = isWinPath ? 'none' : '5,5';

  return (
    <path
      d={path}
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeDasharray={strokeDasharray}
      opacity="0.6"
    />
  );
};

export default PromotionLine;
