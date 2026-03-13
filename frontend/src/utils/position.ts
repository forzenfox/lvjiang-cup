// 位置英文到中文的映射
export const POSITION_MAP: Record<string, string> = {
  top: '上单',
  jungle: '打野',
  mid: '中单',
  bot: 'AD',
  support: '辅助',
};

// 获取位置中文名称
export const getPositionLabel = (position: string): string => {
  return POSITION_MAP[position.toLowerCase()] || position;
};
