/**
 * 对战数据测试夹具
 */

export interface MatchDataFixture {
  matchId: string;
  teamAName: string;
  teamBName: string;
  boFormat: 'BO1' | 'BO3' | 'BO5';
  gameNumber: number;
  gameDuration: string;
  winner: 'red' | 'blue';
}

export const matchDataFixture: MatchDataFixture = {
  matchId: 'test-match-001',
  teamAName: 'BLG',
  teamBName: 'WBG',
  boFormat: 'BO3',
  gameNumber: 1,
  gameDuration: '32:45',
  winner: 'red',
};

export const matchDataFixtureBO5: MatchDataFixture = {
  matchId: 'test-match-002',
  teamAName: 'JDG',
  teamBName: 'TES',
  boFormat: 'BO5',
  gameNumber: 3,
  gameDuration: '28:30',
  winner: 'blue',
};

export const matchDataFixtureBO1: MatchDataFixture = {
  matchId: 'test-match-003',
  teamAName: 'LNG',
  teamBName: 'WBG',
  boFormat: 'BO1',
  gameNumber: 1,
  gameDuration: '25:15',
  winner: 'red',
};
