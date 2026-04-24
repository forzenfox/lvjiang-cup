import React from 'react';
import {
  ELIMINATION_CONNECTORS,
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_TIME_HEIGHT,
} from './eliminationConstants';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';

interface EliminationConnectorsProps {
  cardWidth?: number;
  cardHeight?: number;
  positions?: Record<string, { x: number; y: number }>;
  containerWidth?: number;
}

const EliminationConnectors: React.FC<EliminationConnectorsProps> = ({
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  positions,
  containerWidth: _containerWidth = 900,
}) => {
  // 如果没有传入positions，使用默认计算
  const effectivePositions = positions;

  return (
    <>
      {ELIMINATION_CONNECTORS.map((conn, index) => {
        // 从传入的positions获取位置，如果没有则使用计算后的位置
        const fromPos = effectivePositions?.[conn.from] || { x: 0, y: 0 };
        const toPos = effectivePositions?.[conn.to] || { x: 0, y: 0 };

        // 官方UI连线设计：
        // 从源卡片右侧中间出发（考虑时间标签的高度偏移）
        const startX = fromPos.x + cardWidth;
        const startY = fromPos.y + CARD_TIME_HEIGHT + cardHeight / 2;

        // 到目标卡片左侧中间（考虑时间标签的高度偏移）
        const endX = toPos.x;
        const endY = toPos.y + CARD_TIME_HEIGHT + cardHeight / 2;

        // 计算中间点（水平方向的中点）
        const midX = startX + (endX - startX) / 2;

        return (
          <div key={`connector-${index}`} className="elimination-connector">
            {/* 第一段：从源卡片右侧水平延伸到中间点 */}
            <div
              className="absolute"
              style={{
                left: startX,
                top: startY,
                width: midX - startX,
                height: 1,
                backgroundColor: ELIMINATION_THEME.connector,
              }}
            />
            {/* 第二段：垂直连接（从startY到endY） */}
            <div
              className="absolute"
              style={{
                left: midX,
                top: Math.min(startY, endY),
                width: 1,
                height: Math.abs(endY - startY),
                backgroundColor: ELIMINATION_THEME.connector,
              }}
            />
            {/* 第三段：从中间点水平延伸到目标卡片左侧 */}
            <div
              className="absolute"
              style={{
                left: midX,
                top: endY,
                width: endX - midX,
                height: 1,
                backgroundColor: ELIMINATION_THEME.connector,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export default EliminationConnectors;
