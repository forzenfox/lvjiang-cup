import {
  mockTeams,
  mockTeamNames,
  getTeamById,
  getTeamByName,
} from './mock-data.fixture';

export interface Player {
  name: string;
  avatar?: string;
  position: string;
}

export interface Team {
  name: string;
  logo?: string;
  battleCry: string;
  players: Player[];
}

// 主测试战队 - 使用驴酱战队数据
export const testTeam: Team = {
  name: mockTeams[0].name, // 驴酱
  logo: mockTeams[0].logo,
  battleCry: mockTeams[0].battleCry,
  players: mockTeams[0].players!.map(p => ({
    name: p.nickname,
    position: p.position,
  })),
};

// 第二个测试战队 - 使用 IC 战队数据
export const testTeamBeta: Team = {
  name: mockTeams[1].name, // IC
  logo: mockTeams[1].logo,
  battleCry: mockTeams[1].battleCry,
  players: mockTeams[1].players!.map(p => ({
    name: p.nickname,
    position: p.position,
  })),
};

// 第三个测试战队 - 使用星辰战队数据 (第9支战队)
export const testTeamGamma: Team = {
  name: mockTeams[8].name, // 星辰
  logo: mockTeams[8].logo,
  battleCry: mockTeams[8].battleCry,
  players: mockTeams[8].players!.map(p => ({
    name: p.nickname,
    position: p.position,
  })),
};

// 第四个测试战队 - 使用烈焰战队数据 (第10支战队)
export const testTeamDelta: Team = {
  name: mockTeams[9].name, // 烈焰
  logo: mockTeams[9].logo,
  battleCry: mockTeams[9].battleCry,
  players: mockTeams[9].players!.map(p => ({
    name: p.nickname,
    position: p.position,
  })),
};

// 边界测试 - 短名称 (1个字符)
export const shortNameTeam: Team = {
  name: 'A',
  battleCry: '短名称战队',
  players: [
    { name: mockTeams[2].players![0].nickname, position: 'TOP' }, // 泰妍
    { name: mockTeams[2].players![1].nickname, position: 'JUNGLE' }, // 查理
    { name: mockTeams[2].players![2].nickname, position: 'MID' }, // 二抛
    { name: mockTeams[2].players![3].nickname, position: 'ADC' }, // 芬达
    { name: mockTeams[2].players![4].nickname, position: 'SUPPORT' }, // 小唯
  ],
};

// 边界测试 - 长名称 (50个字符)
export const longNameTeam: Team = {
  name: '这是一个非常长的战队名称用于测试边界条件处理',
  battleCry: '长名称战队测试',
  players: [
    { name: mockTeams[3].players![0].nickname, position: 'TOP' }, // 小达
    { name: mockTeams[3].players![1].nickname, position: 'JUNGLE' }, // 老佳阳
    { name: mockTeams[3].players![2].nickname, position: 'MID' }, // 银剑君
    { name: mockTeams[3].players![3].nickname, position: 'ADC' }, // 秃秃
    { name: mockTeams[3].players![4].nickname, position: 'SUPPORT' }, // 皮皮核桃
  ],
};

// 编辑测试用
export const editedTeam: Partial<Team> = {
  name: '编辑后的战队名称',
  battleCry: '这是编辑后的战队描述',
};

// 获取指定索引的测试战队
export const getTestTeamForMatch = (index: number = 2): Team => {
  const team = mockTeams[index];
  return {
    name: team.name,
    logo: team.logo,
    battleCry: team.battleCry,
    players: team.players!.map(p => ({
      name: p.nickname,
      position: p.position,
    })),
  };
};

// 获取用于瑞士轮测试的全部16支战队数据
export const getAll16TeamsForSwiss = (): Team[] => {
  return mockTeams.map((team, index) => ({
    name: team.name,
    logo: team.logo,
    battleCry: team.battleCry,
    players: team.players!.map(p => ({
      name: p.nickname,
      position: p.position,
    })),
  }));
};

export {
  mockTeams,
  mockTeamNames,
  getTeamById,
  getTeamByName,
};
