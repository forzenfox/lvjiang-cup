export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
}

export const swissRoundSlots: SwissRoundSlot[] = [
  { swissRecord: '0-0', roundName: 'Round 1', maxMatches: 8 },
  { swissRecord: '1-0', roundName: 'Round 2 High', maxMatches: 4 },
  { swissRecord: '0-1', roundName: 'Round 2 Low', maxMatches: 4 },
  { swissRecord: '2-0', roundName: 'Round 3 High', maxMatches: 2 },
  { swissRecord: '1-1', roundName: 'Round 3 Mid', maxMatches: 4 },
  { swissRecord: '0-2', roundName: 'Round 3 Low', maxMatches: 2 },
  { swissRecord: '3-0', roundName: 'Round 4 High', maxMatches: 1 },
  { swissRecord: '2-1', roundName: 'Round 4 Mid-High', maxMatches: 3 },
  { swissRecord: '1-2', roundName: 'Round 4 Mid-Low', maxMatches: 3 },
  { swissRecord: '0-3', roundName: 'Round 4 Low', maxMatches: 1 },
  { swissRecord: '3-1', roundName: 'Round 5 High', maxMatches: 2 },
  { swissRecord: '2-2', roundName: 'Round 5 Mid', maxMatches: 2 },
  { swissRecord: '1-3', roundName: 'Round 5 Low', maxMatches: 2 },
];

export const getSlotByRecord = (swissRecord: string): SwissRoundSlot | undefined => {
  return swissRoundSlots.find(slot => slot.swissRecord === swissRecord);
};

export const getTotalSlots = (): number => {
  return swissRoundSlots.reduce((sum, slot) => sum + slot.maxMatches, 0);
};

/**
 * 根据战绩获取瑞士轮轮次
 * @param swissRecord 战绩字符串，如 "2-1"
 * @returns 轮次号 (1-4)
 */
export const getSwissRound = (swissRecord: string): number => {
  const [wins, losses] = swissRecord.split('-').map(Number);
  return wins + losses;
};

/**
 * 根据战绩获取比赛赛制
 * @param swissRecord 战绩字符串，如 "2-1"
 * @returns 赛制格式 (BO1/BO3/BO5)
 */
export const getRoundFormat = (swissRecord: string): 'BO1' | 'BO3' | 'BO5' => {
  switch (swissRecord) {
    // BO1: 第一轮和第二轮
    case '0-0': // 第一轮
    case '1-0': // 第二轮高组
    case '0-1': // 第二轮低组
    case '1-1': // 第三轮中游组
      return 'BO1';
    // BO5: 晋级/淘汰决胜轮
    case '3-0':
    case '0-3':
      return 'BO5';
    // BO3: 关键晋级/淘汰战
    default:
      return 'BO3';
  }
};

/**
 * 判断队伍是否已被淘汰
 * @param swissRecord 战绩字符串
 * @returns 是否淘汰
 */
export const isEliminated = (swissRecord: string): boolean => {
  return swissRecord === '0-3';
};

/**
 * 判断队伍是否已晋级
 * @param swissRecord 战绩字符串
 * @returns 是否晋级
 */
export const isQualified = (swissRecord: string): boolean => {
  return swissRecord === '3-0';
};
