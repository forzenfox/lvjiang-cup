export const mockTeams = [
  {
    id: '1',
    name: 'Team Alpha',
    logo: 'alpha.png',
    description: 'Champion team',
  },
  {
    id: '2',
    name: 'Team Beta',
    logo: 'beta.png',
    description: 'Runner-up team',
  },
  {
    id: '3',
    name: 'Team Gamma',
    logo: 'gamma.png',
    description: 'Third place team',
  },
];

export const mockPlayers = [
  {
    id: '1',
    teamId: '1',
    name: 'Player1',
    role: 'TOP',
  },
  {
    id: '2',
    teamId: '1',
    name: 'Player2',
    role: 'JUNGLE',
  },
  {
    id: '3',
    teamId: '1',
    name: 'Player3',
    role: 'MID',
  },
  {
    id: '4',
    teamId: '1',
    name: 'Player4',
    role: 'adc',
  },
  {
    id: '5',
    teamId: '1',
    name: 'Player5',
    role: 'SUPPORT',
  },
];

export const mockMatches = [
  {
    id: '1',
    teamAId: '1',
    teamBId: '2',
    scoreA: 2,
    scoreB: 1,
    winnerId: '1',
    stage: 'swiss',
    round: '第一�?,
    status: 'finished',
    startTime: new Date().toISOString(),
    swissRecord: '0-0',
    swissDay: 1,
  },
  {
    id: '2',
    teamAId: '3',
    teamBId: '1',
    scoreA: 1,
    scoreB: 2,
    winnerId: '1',
    stage: 'swiss',
    round: '第二�?,
    status: 'finished',
    startTime: new Date().toISOString(),
    swissRecord: '1-0',
    swissDay: 1,
  },
];

export const mockStreamInfo = {
  title: '驴酱�?LOL 娱乐赛事',
  url: 'https://www.douyu.com/12345',
  isLive: true,
};

export const mockAdvancement = {
  winners2_0: ['1', '2'],
  winners2_1: ['3', '4'],
  losersBracket: ['5', '6'],
  eliminated3rd: ['7', '8'],
  eliminated0_3: ['9', '10'],
};

export function createMockTeam(overrides?: Partial<any>) {
  return {
    id: `team-${Date.now()}`,
    name: 'Test Team',
    logo: 'test.png',
    description: 'Test description',
    ...overrides,
  };
}

export function createMockPlayer(overrides?: Partial<any>) {
  return {
    id: `player-${Date.now()}`,
    teamId: '1',
    name: 'Test Player',
    role: 'TOP',
    ...overrides,
  };
}

export function createMockMatch(overrides?: Partial<any>) {
  return {
    id: `match-${Date.now()}`,
    teamAId: '1',
    teamBId: '2',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    stage: 'swiss',
    round: '第一�?,
    status: 'upcoming',
    startTime: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockStreamInfo(overrides?: Partial<any>) {
  return {
    title: 'Test Stream',
    url: 'https://example.com/stream',
    isLive: false,
    ...overrides,
  };
}

export function createMockAdvancement(overrides?: Partial<any>) {
  return {
    winners2_0: [],
    winners2_1: [],
    losersBracket: [],
    eliminated3rd: [],
    eliminated0_3: [],
    ...overrides,
  };
}
