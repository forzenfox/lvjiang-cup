import React from 'react';
import { ELIMINATION_POSITIONS, ELIMINATION_CONNECTORS } from './eliminationConstants';

interface EliminationConnectorsProps {
  cardWidth?: number;
  cardHeight?: number;
}

const EliminationConnectors: React.FC<EliminationConnectorsProps> = ({
  cardWidth = 192, // w-48 = 12rem = 192px
  cardHeight = 100, // 估算卡片高度
}) => {
  return (
    <>
      {ELIMINATION_CONNECTORS.map((conn, index) => {
        const fromPos = ELIMINATION_POSITIONS[conn.from];
        const toPos = ELIMINATION_POSITIONS[conn.to];

        const startX = fromPos.x + cardWidth;
        const startY = fromPos.y + cardHeight / 2;
        const endX = toPos.x;
        const endY = toPos.y + cardHeight / 2;

        const midX = startX + (endX - startX) / 2;

        return (
          <div key={`connector-${index}`} className="elimination-connector">
            {/* 水平线段：从起点到中间 */}
            <div
              className="absolute bg-gray-600"
              style={{
                left: startX,
                top: startY - 1,
                width: midX - startX,
                height: 2,
              }}
            />
            {/* 垂直线段：连接两个y坐标 */}
            <div
              className="absolute bg-gray-600"
              style={{
                left: midX - 1,
                top: Math.min(startY, endY),
                width: 2,
                height: Math.abs(endY - startY),
              }}
            />
            {/* 水平线段：从中间到终点 */}
            <div
              className="absolute bg-gray-600"
              style={{
                left: midX,
                top: endY - 1,
                width: endX - midX,
                height: 2,
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export default EliminationConnectors;
