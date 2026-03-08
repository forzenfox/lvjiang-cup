import { Team, Match, StreamInfo } from '../types';
import { initialTeams, initialMatches, initialStreamInfo } from './data';

// In-memory storage simulation
let teams = [...initialTeams];
let matches = [...initialMatches];
let streamInfo = { ...initialStreamInfo };

const DELAY = 500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Team APIs
  getTeams: async (): Promise<Team[]> => {
    await delay(DELAY);
    return [...teams];
  },

  updateTeam: async (updatedTeam: Team): Promise<Team> => {
    await delay(DELAY);
    teams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    return updatedTeam;
  },
  
  addTeam: async (newTeam: Team): Promise<Team> => {
    await delay(DELAY);
    teams.push(newTeam);
    return newTeam;
  },
  
  deleteTeam: async (id: string): Promise<void> => {
    await delay(DELAY);
    teams = teams.filter(t => t.id !== id);
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
    return updatedMatch;
  },

  // Stream APIs
  getStreamInfo: async (): Promise<StreamInfo> => {
    await delay(DELAY);
    return { ...streamInfo };
  },

  updateStreamInfo: async (info: StreamInfo): Promise<StreamInfo> => {
    await delay(DELAY);
    streamInfo = { ...info };
    return streamInfo;
  }
};
