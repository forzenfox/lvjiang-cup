export interface SwissRoundSlot {
  swissRecord: string;
  roundName: string;
  maxMatches: number;
}

export const swissRoundSlots: SwissRoundSlot[] = [
  { swissRecord: '0-0', roundName: 'Round 1', maxMatches: 4 },
  { swissRecord: '1-0', roundName: 'Round 2 High', maxMatches: 2 },
  { swissRecord: '0-1', roundName: 'Round 2 Low', maxMatches: 2 },
  { swissRecord: '1-1', roundName: 'Round 3 Mid', maxMatches: 2 },
  { swissRecord: '0-2', roundName: 'Round 3 Low', maxMatches: 1 },
  { swissRecord: '1-2', roundName: 'Last Chance', maxMatches: 3 },
];

export const getRoundFormat = (swissRecord: string): 'BO1' | 'BO3' => {
  return swissRecord === '0-0' ? 'BO1' : 'BO3';
};

export const getSlotByRecord = (swissRecord: string): SwissRoundSlot | undefined => {
  return swissRoundSlots.find(slot => slot.swissRecord === swissRecord);
};

export const getTotalSlots = (): number => {
  return swissRoundSlots.reduce((sum, slot) => sum + slot.maxMatches, 0);
};
