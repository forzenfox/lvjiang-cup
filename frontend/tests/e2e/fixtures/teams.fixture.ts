import {
  mockTeams,
  mockSwissMatches,
  mockEliminationMatches,
  mockTeamNames,
  getTeamById,
} from './mock-data.fixture';

export interface Player {
  name: string;
  avatar?: string;
  position: string;
}

export interface Team {
  name: string;
  logo?: string;
  description: string;
  players: Player[];
}

export const testTeam: Team = {
  name: mockTeams[0].name,
  logo: mockTeams[0].logo,
  description: mockTeams[0].description,
  players: mockTeams[0].players!.map(p => ({
    name: p.name,
    position: p.position,
  })),
};

export const shortNameTeam: Team = {
  name: 'A',
  description: '短名称战队',
  players: [
    { name: '选手1', position: 'TOP' },
    { name: '选手2', position: 'JUNGLE' },
    { name: '选手3', position: 'MID' },
    { name: '选手4', position: 'ADC' },
    { name: '选手5', position: 'SUPPORT' },
  ],
};

export const longNameTeam: Team = {
  name: '这是一个非常长的战队名称用于测试边界条件处理',
  description: '长名称战队测试',
  players: [
    { name: '选手1', position: 'TOP' },
    { name: '选手2', position: 'JUNGLE' },
    { name: '选手3', position: 'MID' },
    { name: '选手4', position: 'ADC' },
    { name: '选手5', position: 'SUPPORT' },
  ],
};

export const editedTeam: Partial<Team> = {
  name: '编辑后的战队名称',
  description: '这是编辑后的战队描述',
};

export const testTeamBeta: Team = {
  name: mockTeams[1].name,
  logo: mockTeams[1].logo,
  description: mockTeams[1].description,
  players: mockTeams[1].players!.map(p => ({
    name: p.name,
    position: p.position,
  })),
};

export const getTestTeamForMatch = (index: number = 2): Team => {
  const team = mockTeams[index];
  return {
    name: team.name,
    logo: team.logo,
    description: team.description,
    players: team.players!.map(p => ({
      name: p.name,
      position: p.position,
    })),
  };
};

export { mockTeams, mockTeamNames, mockSwissMatches, mockEliminationMatches, getTeamById };
