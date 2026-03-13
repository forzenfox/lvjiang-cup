/**
 * 战队测试数据
 */

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

/**
 * 测试战队数据
 */
export const testTeam: Team = {
  name: '测试战队',
  logo: 'https://example.com/logo.png',
  description: '这是一个测试战队',
  players: [
    { name: '上单选手', position: 'top' },
    { name: '打野选手', position: 'jungle' },
    { name: '中单选手', position: 'mid' },
    { name: 'AD选手', position: 'bot' },
    { name: '辅助选手', position: 'support' },
  ],
};

/**
 * 边界测试数据 - 短名称
 */
export const shortNameTeam: Team = {
  name: 'A',
  description: '短名称战队',
  players: [
    { name: '选手1', position: 'top' },
    { name: '选手2', position: 'jungle' },
    { name: '选手3', position: 'mid' },
    { name: '选手4', position: 'bot' },
    { name: '选手5', position: 'support' },
  ],
};

/**
 * 边界测试数据 - 长名称
 */
export const longNameTeam: Team = {
  name: '这是一个非常长的战队名称用于测试边界条件处理',
  description: '长名称战队测试',
  players: [
    { name: '选手1', position: 'top' },
    { name: '选手2', position: 'jungle' },
    { name: '选手3', position: 'mid' },
    { name: '选手4', position: 'bot' },
    { name: '选手5', position: 'support' },
  ],
};

/**
 * 编辑战队数据
 */
export const editedTeam: Partial<Team> = {
  name: '编辑后的战队名称',
  description: '这是编辑后的战队描述',
};
