import { Team, Match, StreamInfo } from '../types';
import { initialTeams, initialMatches, initialStreamInfo } from './data';

const DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 从 localStorage 加载数据，如果不存在则使用初始数据
const loadFromStorage = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialData;
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

  // 重置所有数据到初始状态
  resetAllData: async (): Promise<void> => {
    await delay(DELAY);
    localStorage.removeItem('teams');
    localStorage.removeItem('matches');
    localStorage.removeItem('streamInfo');
    teams = [...initialTeams];
    matches = [...initialMatches];
    streamInfo = { ...initialStreamInfo };
  }
};
