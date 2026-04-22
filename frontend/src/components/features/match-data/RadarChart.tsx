import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsType } from 'echarts/core';
import { motion, AnimatePresence } from 'framer-motion';

import type { PlayerStat, TeamGameData, RadarDimension } from '@/types/matchData';
import type { PositionType } from '@/types/position';
import {
  normalizeRadarValue,
  calculateRadarDimension,
  getRadarDimensionConfig,
} from '@/utils/radarCalculations';

// 按需注册 ECharts 模块
echarts.use([RadarChart, TooltipComponent, GridComponent, CanvasRenderer]);

// 颜色常量
const COLORS = {
  redTeam: '#f44336',
  redTeamFill: 'rgba(244, 67, 54, 0.3)',
  blueTeam: '#00bcd4',
  blueTeamFill: 'rgba(0, 188, 212, 0.3)',
  gridLines: 'rgba(255, 255, 255, 0.1)',
  axisLines: 'rgba(255, 255, 255, 0.15)',
  labels: '#b0b0b0',
} as const;

interface RadarChartProps {
  player1: PlayerStat;
  player2: PlayerStat;
  gameDuration: string;
  redTeamStats: TeamGameData;
  blueTeamStats: TeamGameData;
  visible: boolean;
}

interface NormalizedPlayerData {
  name: string;
  teamName: string;
  side: 'red' | 'blue';
  values: number[];
  rawValues: number[];
}

/**
 * 雷达图内部组件（未包裹memo）
 */
const RadarChartInner: React.FC<RadarChartProps> = ({
  player1,
  player2,
  gameDuration,
  redTeamStats,
  blueTeamStats,
  visible,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<EChartsType | null>(null);
  const [dimensions, setDimensions] = useState<RadarDimension[]>([]);
  const [normalizedData, setNormalizedData] = useState<NormalizedPlayerData[]>([]);

  // 确定玩家所属阵营
  const getPlayerSide = useCallback(
    (player: PlayerStat): 'red' | 'blue' => {
      return player.teamId === redTeamStats.teamId ? 'red' : 'blue';
    },
    [redTeamStats.teamId]
  );

  // 获取队伍统计数据
  const getTeamStats = useCallback(
    (player: PlayerStat): TeamGameData => {
      return player.teamId === redTeamStats.teamId ? redTeamStats : blueTeamStats;
    },
    [redTeamStats, blueTeamStats]
  );

  // 计算雷达图数据
  useEffect(() => {
    const position = player1.position as PositionType;
    const config = getRadarDimensionConfig(position);
    setDimensions(config);

    const player1Side = getPlayerSide(player1);
    const player2Side = getPlayerSide(player2);
    const teamStats1 = getTeamStats(player1);
    const teamStats2 = getTeamStats(player2);

    const rawValues1 = calculateRadarDimension(player1, position, teamStats1, gameDuration);
    const rawValues2 = calculateRadarDimension(player2, position, teamStats2, gameDuration);

    // 计算每个维度的最大值用于归一化
    const maxValues = config.map((_, index) => Math.max(rawValues1[index], rawValues2[index]));

    // 归一化数据
    const normalized1: NormalizedPlayerData = {
      name: player1.playerName,
      teamName: player1.teamName,
      side: player1Side,
      values: rawValues1.map((v, i) => normalizeRadarValue(v, maxValues[i])),
      rawValues: rawValues1,
    };

    const normalized2: NormalizedPlayerData = {
      name: player2.playerName,
      teamName: player2.teamName,
      side: player2Side,
      values: rawValues2.map((v, i) => normalizeRadarValue(v, maxValues[i])),
      rawValues: rawValues2,
    };

    setNormalizedData([normalized1, normalized2]);
  }, [player1, player2, gameDuration, redTeamStats, blueTeamStats, getPlayerSide, getTeamStats]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas',
    });
    chartInstanceRef.current = chart;

    return () => {
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // 响应式调整
  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 更新图表配置
  useEffect(() => {
    if (!chartInstanceRef.current || dimensions.length === 0 || normalizedData.length === 0) {
      return;
    }

    const indicator = dimensions.map(dim => ({
      name: dim.label,
      max: 1,
    }));

    const seriesData = normalizedData.map(player => ({
      name: `${player.name} (${player.teamName})`,
      value: player.values,
      lineStyle: {
        color: player.side === 'red' ? COLORS.redTeam : COLORS.blueTeam,
        width: 2,
      },
      areaStyle: {
        color: player.side === 'red' ? COLORS.redTeamFill : COLORS.blueTeamFill,
      },
      itemStyle: {
        color: player.side === 'red' ? COLORS.redTeam : COLORS.blueTeam,
      },
    }));

    const option = {
      tooltip: {
        trigger: 'item' as const,
        formatter: (params: { name: string; value: number[] }) => {
          const playerData = normalizedData.find(d => `${d.name} (${d.teamName})` === params.name);
          if (!playerData) return '';

          const tooltipLines = [`<strong>${params.name}</strong>`, ''];
          dimensions.forEach((dim, index) => {
            const rawValue = playerData.rawValues[index];
            const displayValue =
              dim.key === 'kda' || dim.key === 'assists'
                ? rawValue.toFixed(1)
                : rawValue.toFixed(2);
            tooltipLines.push(`${dim.label}: ${displayValue}`);
          });
          return tooltipLines.join('<br/>');
        },
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
      },
      radar: {
        indicator,
        shape: 'polygon',
        splitNumber: 5,
        axisName: {
          color: COLORS.labels,
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: COLORS.gridLines,
          },
        },
        axisLine: {
          lineStyle: {
            color: COLORS.axisLines,
          },
        },
        splitArea: {
          show: false,
        },
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          symbol: 'circle',
          symbolSize: 4,
          animationDuration: 300,
          animationEasing: 'cubicOut' as const,
        },
      ],
      animation: false,
    };

    chartInstanceRef.current.setOption(option, true);
  }, [dimensions, normalizedData]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div
            ref={chartRef}
            style={{
              width: '100%',
              height: '400px',
              minHeight: '300px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 雷达图组件（使用 React.memo 优化，避免不必要的重渲染）
 */
const RadarChartComponent = React.memo(RadarChartInner);

export default RadarChartComponent;
