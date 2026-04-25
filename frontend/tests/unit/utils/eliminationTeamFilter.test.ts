import { describe, it, expect } from 'vitest';
import { getQualifiedTeams, getUsedTeamIds } from '@/utils/eliminationTeamFilter';
import type { Team, Match, SwissAdvancementResult } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '测试队伍1' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '测试队伍2' },
  { id: 'team3', name: 'IC', logo: '/logo3.png', players: [], battleCry: '测试队伍3' },
  { id: 'team4', name: '小熊', logo: '/logo4.png', players: [], battleCry: '测试队伍4' },
  { id: 'team5', name: 'PLG', logo: '/logo5.png', players: [], battleCry: '测试队伍5' },
  { id: 'team6', name: '69', logo: '/logo6.png', players: [], battleCry: '测试队伍6' },
  { id: 'team7', name: '老虎', logo: '/logo7.png', players: [], battleCry: '测试队伍7' },
  { id: 'team8', name: '兔子', logo: '/logo8.png', players: [], battleCry: '测试队伍8' },
];

describe('getQualifiedTeams', () => {
  it('应该只返回瑞士轮晋级的队伍', () => {
    const advancement: SwissAdvancementResult = {
      top8: ['team1', 'team2', 'team3', 'team4'],
      eliminated: [],
      rankings: [],
    };

    const qualifiedTeams = getQualifiedTeams(mockTeams, advancement);

    expect(qualifiedTeams).toHaveLength(4);
    expect(qualifiedTeams.map(t => t.id)).toEqual(['team1', 'team2', 'team3', 'team4']);
  });

  it('应该排除已淘汰的队伍', () => {
    const advancement: SwissAdvancementResult = {
      top8: ['team1', 'team2', 'team3', 'team4'],
      eliminated: ['team5', 'team6', 'team7', 'team8'],
      rankings: [],
    };

    const qualifiedTeams = getQualifiedTeams(mockTeams, advancement);

    expect(qualifiedTeams).toHaveLength(4);
    expect(qualifiedTeams.every(t => !advancement.eliminated.includes(t.id))).toBe(true);
  });

  it('应该返回空数组当没有晋级队伍', () => {
    const advancement: SwissAdvancementResult = {
      top8: [],
      eliminated: ['team1', 'team2', 'team3', 'team4'],
      rankings: [],
    };

    const qualifiedTeams = getQualifiedTeams(mockTeams, advancement);

    expect(qualifiedTeams).toHaveLength(0);
  });
});

describe('getUsedTeamIds', () => {
  const mockMatches: Match[] = [
    {
      id: 'match-1',
      teamAId: 'team1',
      teamBId: 'team2',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      round: 'QF1',
      status: 'upcoming',
      stage: 'elimination',
      eliminationBracket: 'quarterfinals',
    },
    {
      id: 'match-2',
      teamAId: 'team3',
      teamBId: 'team4',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      round: 'QF2',
      status: 'upcoming',
      stage: 'elimination',
      eliminationBracket: 'quarterfinals',
    },
    {
      id: 'match-3',
      teamAId: '',
      teamBId: '',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      round: 'QF3',
      status: 'upcoming',
      stage: 'elimination',
      eliminationBracket: 'quarterfinals',
    },
    {
      id: 'match-4',
      teamAId: 'team5',
      teamBId: 'team6',
      scoreA: 0,
      scoreB: 0,
      winnerId: null,
      round: 'SF1',
      status: 'upcoming',
      stage: 'elimination',
      eliminationBracket: 'semifinals',
    },
  ];

  it('应该返回同一轮次中已使用的队伍ID', () => {
    const usedTeamIds = getUsedTeamIds(mockMatches, 'match-3', 'quarterfinals');

    expect(usedTeamIds).toEqual(new Set(['team1', 'team2', 'team3', 'team4']));
  });

  it('应该排除当前正在编辑的比赛', () => {
    const usedTeamIds = getUsedTeamIds(mockMatches, 'match-1', 'quarterfinals');

    expect(usedTeamIds).toEqual(new Set(['team3', 'team4']));
    expect(usedTeamIds.has('team1')).toBe(false);
    expect(usedTeamIds.has('team2')).toBe(false);
  });

  it('应该只考虑同一轮次的比赛', () => {
    const usedTeamIds = getUsedTeamIds(mockMatches, 'match-3', 'semifinals');

    expect(usedTeamIds).toEqual(new Set(['team5', 'team6']));
  });

  it('应该忽略空队伍ID', () => {
    const usedTeamIds = getUsedTeamIds(mockMatches, 'match-3', 'quarterfinals');

    expect(usedTeamIds.has('')).toBe(false);
  });
});
