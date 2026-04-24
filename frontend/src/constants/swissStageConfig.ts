export const SWISS_STAGE_CONFIG = {
  rounds: [
    { round: 1, records: ['0-0'], boFormat: 'BO1', label: '第一轮' },
    { round: 2, records: ['1-0', '0-1'], boFormat: 'BO1', label: '第二轮' },
    { round: 3, records: ['2-0', '1-1', '0-2'], boFormat: 'BO1', label: '第三轮' },
    { round: 4, records: ['2-1', '1-2'], boFormat: 'BO3', label: '第四轮' },
    { round: 5, records: ['2-2'], boFormat: 'BO3', label: '第五轮' },
  ],

  qualifiedRecords: {
    3: ['3-0'],
    4: ['3-1'],
    5: ['3-2'],
  },

  eliminatedRecords: {
    3: ['0-3'],
    4: ['1-3'],
    5: ['2-3'],
  },

  recordLabels: {
    '3-0': '3-0 晋级',
    '2-0': '2-0',
    '1-0': '1-0',
    '0-0': '0-0',
    '0-1': '0-1',
    '1-1': '1-1',
    '2-1': '2-1',
    '0-2': '0-2',
    '1-2': '1-2',
    '0-3': '0-3 淘汰',
    '3-1': '3-1 晋级',
    '2-2': '2-2',
    '1-3': '1-3 淘汰',
    '3-2': '3-2 晋级',
    '2-3': '2-3 淘汰',
  } as Record<string, string>,
} as const;

export type SwissRound = 1 | 2 | 3 | 4 | 5;
export type RecordKey =
  | '0-0'
  | '1-0'
  | '0-1'
  | '2-0'
  | '1-1'
  | '0-2'
  | '3-0'
  | '2-1'
  | '1-2'
  | '0-3'
  | '3-1'
  | '2-2'
  | '1-3'
  | '3-2'
  | '2-3';
export type BoFormat = 'BO1' | 'BO3';

export interface RoundConfig {
  round: SwissRound;
  records: string[];
  boFormat: BoFormat;
  label: string;
}
