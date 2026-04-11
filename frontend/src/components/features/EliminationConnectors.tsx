import React from 'react';
import { ELIMINATION_POSITIONS, ELIMINATION_CONNECTORS } from './eliminationConstants';
import { ELIMINATION_THEME } from '@/constants/eliminationTheme';

interface EliminationConnectorsProps {
  cardWidth?: number;
  cardHeight?: number;
}

const EliminationConnectors: React.FC<EliminationConnectorsProps> = ({
  cardWidth = 180,
  cardHeight = 73,
}) => {
  return (
    <>
      {ELIMINATION_CONNECTORS.map((conn, index) => {
        const fromPos = ELIMINATION_POSITIONS[conn.from];
        const toPos = ELIMINATION_POSITIONS[conn.to];

        // 官方UI连线设计：
        // 从源卡片右侧中间出发
        const startX = fromPos.x + cardWidth;
        const startY = fromPos.y + cardHeight / 2;
        
        // 到目标卡片左侧中间
        const endX = toPos.x;
        const endY = toPos.y + cardHeight / 2;

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
