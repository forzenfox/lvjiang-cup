import { Match } from '../types';

export const matches: Match[] = [
  // === 瑞士轮 ===
  // Day1 - 0-0 BO1
  {
    id: 'swiss-d1-1', teamAId: 'team1', teamBId: 'team6', scoreA: 1, scoreB: 0, winnerId: 'team1',
    round: 'Day1 11.13', status: 'finished', startTime: '2025-11-13T18:00:00Z', stage: 'swiss', swissRecord: '0-0', swissDay: 1
  },
  {
    id: 'swiss-d1-2', teamAId: 'team7', teamBId: 'team8', scoreA: 1, scoreB: 0, winnerId: 'team7',
    round: 'Day1 11.13', status: 'finished', startTime: '2025-11-13T19:00:00Z', stage: 'swiss', swissRecord: '0-0', swissDay: 1
  },
  {
    id: 'swiss-d1-3', teamAId: 'team4', teamBId: 'team2', scoreA: 1, scoreB: 0, winnerId: 'team4',
    round: 'Day1 11.13', status: 'finished', startTime: '2025-11-13T20:00:00Z', stage: 'swiss', swissRecord: '0-0', swissDay: 1
  },
  {
    id: 'swiss-d1-4', teamAId: 'team5', teamBId: 'team3', scoreA: 0, scoreB: 1, winnerId: 'team3',
    round: 'Day1 11.13', status: 'finished', startTime: '2025-11-13T21:00:00Z', stage: 'swiss', swissRecord: '0-0', swissDay: 1
  },
  // Day2 - 1-0 BO3
  {
    id: 'swiss-d2-1', teamAId: 'team1', teamBId: 'team8', scoreA: 2, scoreB: 0, winnerId: 'team1',
    round: 'Day2 11.14', status: 'finished', startTime: '2025-11-14T18:00:00Z', stage: 'swiss', swissRecord: '1-0', swissDay: 2
  },
  {
    id: 'swiss-d2-2', teamAId: 'team2', teamBId: 'team5', scoreA: 2, scoreB: 1, winnerId: 'team2',
    round: 'Day2 11.14', status: 'finished', startTime: '2025-11-14T18:00:00Z', stage: 'swiss', swissRecord: '1-0', swissDay: 2
  },
  // Day2 - 0-1 BO3
  {
    id: 'swiss-d2-3', teamAId: 'team4', teamBId: 'team6', scoreA: 2, scoreB: 0, winnerId: 'team4',
    round: 'Day2 11.14', status: 'finished', startTime: '2025-11-14T20:00:00Z', stage: 'swiss', swissRecord: '0-1', swissDay: 2
  },
  {
    id: 'swiss-d2-4', teamAId: 'team7', teamBId: 'team3', scoreA: 1, scoreB: 2, winnerId: 'team3',
    round: 'Day2 11.14', status: 'finished', startTime: '2025-11-14T20:00:00Z', stage: 'swiss', swissRecord: '0-1', swissDay: 2
  },
  // Day3 - 1-1 BO3
  {
    id: 'swiss-d3-1', teamAId: 'team4', teamBId: 'team5', scoreA: 2, scoreB: 1, winnerId: 'team4',
    round: 'Day3 11.15', status: 'finished', startTime: '2025-11-15T18:00:00Z', stage: 'swiss', swissRecord: '1-1', swissDay: 3
  },
  {
    id: 'swiss-d3-2', teamAId: 'team3', teamBId: 'team8', scoreA: 2, scoreB: 0, winnerId: 'team3',
    round: 'Day3 11.15', status: 'finished', startTime: '2025-11-15T18:00:00Z', stage: 'swiss', swissRecord: '1-1', swissDay: 3
  },
  // Day3 - 0-2 生死战 BO3
  {
    id: 'swiss-d3-3', teamAId: 'team6', teamBId: 'team7', scoreA: 0, scoreB: 2, winnerId: 'team7',
    round: 'Day3 11.15', status: 'finished', startTime: '2025-11-15T20:00:00Z', stage: 'swiss', swissRecord: '0-2', swissDay: 3
  },
  // Day4 - 1-2 积分循环 BO3
  {
    id: 'swiss-d4-1', teamAId: 'team3', teamBId: 'team7', scoreA: 2, scoreB: 1, winnerId: 'team3',
    round: 'Day4 11.16', status: 'finished', startTime: '2025-11-16T18:00:00Z', stage: 'swiss', swissRecord: '1-2', swissDay: 4
  },
  {
    id: 'swiss-d4-2', teamAId: 'team5', teamBId: 'team7', scoreA: 1, scoreB: 2, winnerId: 'team7',
    round: 'Day4 11.16', status: 'finished', startTime: '2025-11-16T19:00:00Z', stage: 'swiss', swissRecord: '1-2', swissDay: 4
  },
  {
    id: 'swiss-d4-3', teamAId: 'team5', teamBId: 'team3', scoreA: 0, scoreB: 2, winnerId: 'team3',
    round: 'Day4 11.16', status: 'finished', startTime: '2025-11-16T20:00:00Z', stage: 'swiss', swissRecord: '1-2', swissDay: 4
  },

  // === 淘汰赛 (6队双败制) ===
  // Upper Bracket Round 1
  {
    id: 'elim-g1', teamAId: 'team1', teamBId: 'team8', scoreA: 3, scoreB: 2, winnerId: 'team1',
    round: '胜者组半决赛', status: 'finished', startTime: '2025-11-17T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'winners', eliminationGameNumber: 1
  },
  {
    id: 'elim-g2', teamAId: 'team2', teamBId: 'team4', scoreA: 2, scoreB: 3, winnerId: 'team4',
    round: '胜者组半决赛', status: 'finished', startTime: '2025-11-18T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'winners', eliminationGameNumber: 2
  },
  // Lower Bracket Round 1
  {
    id: 'elim-g3', teamAId: 'team3', teamBId: 'team8', scoreA: 1, scoreB: 3, winnerId: 'team8',
    round: '败者组第一轮', status: 'finished', startTime: '2025-11-19T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'losers', eliminationGameNumber: 3
  },
  {
    id: 'elim-g4', teamAId: 'team7', teamBId: 'team2', scoreA: 0, scoreB: 3, winnerId: 'team2',
    round: '败者组第一轮', status: 'finished', startTime: '2025-11-20T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'losers', eliminationGameNumber: 4
  },
  // Upper Bracket Final
  {
    id: 'elim-g5', teamAId: 'team1', teamBId: 'team4', scoreA: 2, scoreB: 3, winnerId: 'team4',
    round: '胜者组决赛', status: 'finished', startTime: '2025-11-21T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'winners', eliminationGameNumber: 5
  },
  // Lower Bracket Round 2
  {
    id: 'elim-g6', teamAId: 'team8', teamBId: 'team2', scoreA: 1, scoreB: 3, winnerId: 'team2',
    round: '败者组第二轮', status: 'finished', startTime: '2025-11-21T20:00:00Z', stage: 'elimination',
    eliminationBracket: 'losers', eliminationGameNumber: 6
  },
  // Lower Bracket Final
  {
    id: 'elim-g7', teamAId: 'team2', teamBId: 'team1', scoreA: 3, scoreB: 2, winnerId: 'team2',
    round: '败者组决赛', status: 'finished', startTime: '2025-11-22T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'losers', eliminationGameNumber: 7
  },
  // Grand Final
  {
    id: 'elim-g8', teamAId: 'team4', teamBId: 'team2', scoreA: 3, scoreB: 1, winnerId: 'team4',
    round: '总决赛', status: 'finished', startTime: '2025-11-23T18:00:00Z', stage: 'elimination',
    eliminationBracket: 'grand_finals', eliminationGameNumber: 8
  }
];