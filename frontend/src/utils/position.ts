import { PositionType } from '../types/position';

// 位置英文到中文的映射
export const POSITION_MAP: Record<PositionType, string> = {
  TOP: '上单',
  JUNGLE: '打野',
  MID: '中单',
  ADC: '射手',
  SUPPORT: '辅助',
};

// 获取位置中文名称
export const getPositionLabel = (position: PositionType | string): string => {
  return POSITION_MAP[position as PositionType] || position;
};
