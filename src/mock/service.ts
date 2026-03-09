import { Team, Match, StreamInfo } from '../types';
import { initialTeams, initialMatches, initialStreamInfo } from './data';

const DELAY = 500;
const CLEAR_FLAG = 'data_cleared';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 从 localStorage 加载数据，如果不存在则使用初始数据
const loadFromStorage = <T>(key: string, initialData: T): T => {
  // 如果数据被清空过，不使用初始数据
  if (localStorage.getItem(CLEAR_FLAG) === 'true') {
    const stored = localStorage.getItem(key);
    if (!stored) {
      // 返回空数组或空对象
      return Array.isArray(initialData) ? [] as T : {} as T;
    }
    try {
      return JSON.parse(stored);
    } catch (e) {
      return Array.isArray(initialData) ? [] as T : {} as T;
    }
  }

  const stored = localStorage.getItem(key);
  if (!stored) return initialData;

  try {
    const parsed = JSON.parse(stored);
    // 检查数组是否为空
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log(`[MockService] ${key} 为空数组，使用初始数据`);
      return initialData;
    }
    return parsed;
  } catch (e) {
    console.error(`[MockService] 解析 ${key} 失败，使用初始数据`, e);
    return initialData;
  }
};

// 保存数据到 localStorage
const saveToStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// 初始化数据（从 localStorage 读取，如果不存在则使用初始数据）
let teams = loadFromStorage('teams', [...initialTeams]);
let matches = loadFromStorage('matches', [...initialMatches]);
let streamInfo = loadFromStorage('streamInfo', { ...initialStreamInfo });

export const mockService = {
  // Team APIs
  getTeams: async (): Promise<Team[]> => {
    await delay(DELAY);
    return [...teams];
  },

  updateTeam: async (updatedTeam: Team): Promise<Team> => {
    await delay(DELAY);
    teams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    saveToStorage('teams', teams);
    return updatedTeam;
  },

  addTeam: async (newTeam: Team): Promise<Team> => {
    await delay(DELAY);
    teams.push(newTeam);
    saveToStorage('teams', teams);
    return newTeam;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await delay(DELAY);
    teams = teams.filter(t => t.id !== id);
    saveToStorage('teams', teams);
  },

  // Match APIs
  getMatches: async (): Promise<Match[]> => {
    await delay(DELAY);
    // Enrich matches with team data
    return matches.map(match => ({
      ...match,
      teamA: teams.find(t => t.id === match.teamAId),
      teamB: teams.find(t => t.id === match.teamBId)
    }));
  },

  updateMatch: async (updatedMatch: Match): Promise<Match> => {
    await delay(DELAY);
    matches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    saveToStorage('matches', matches);
    return updatedMatch;
  },

  addMatch: async (newMatch: Omit<Match, 'id'>): Promise<Match> => {
    await delay(DELAY);
    const match: Match = { ...newMatch, id: `match-${Date.now()}` };
    matches.push(match);
    saveToStorage('matches', matches);
    return match;
  },

  // Stream APIs
  getStreamInfo: async (): Promise<StreamInfo> => {
    await delay(DELAY);
    return { ...streamInfo };
  },

  updateStreamInfo: async (info: StreamInfo): Promise<StreamInfo> => {
    await delay(DELAY);
    streamInfo = { ...info };
    saveToStorage('streamInfo', streamInfo);
    return streamInfo;
  },

  // 加载Mock数据 - 使用data.ts中的初始数据覆盖localStorage
  resetAllData: async (): Promise<void> => {
    await delay(DELAY);
    // 移除清空标志，允许使用初始数据
    localStorage.removeItem(CLEAR_FLAG);
    // 使用初始数据覆盖
    teams = [...initialTeams];
    matches = [...initialMatches];
    streamInfo = { ...initialStreamInfo };
    // 保存到 localStorage
    saveToStorage('teams', teams);
    saveToStorage('matches', matches);
    saveToStorage('streamInfo', streamInfo);
  },

  // 清空所有数据（不重置为初始值）
  clearAllData: async (): Promise<void> => {
    await delay(DELAY);
    localStorage.removeItem('teams');
    localStorage.removeItem('matches');
    localStorage.removeItem('streamInfo');
    // 设置清空标志，防止自动加载初始数据
    localStorage.setItem(CLEAR_FLAG, 'true');
    teams = [];
    matches = [];
    streamInfo = {} as StreamInfo;
  }
};
