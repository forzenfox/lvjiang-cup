// 队员位置枚举
export enum PlayerPosition {
  TOP = 'TOP',
  JUNGLE = 'JUNGLE',
  MID = 'MID',
  ADC = 'ADC',
  SUPPORT = 'SUPPORT',
}

// 位置类型
export type PositionType = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';

// 位置中文映射
export const POSITION_LABEL_MAP: Record<PositionType, string> = {
  TOP: '上单',
  JUNGLE: '打野',
  MID: '中单',
  ADC: '射手',
  SUPPORT: '辅助',
};

// 获取位置中文名称
export const getPositionLabel = (position: PositionType | string): string => {
  return POSITION_LABEL_MAP[position as PositionType] || position;
};
