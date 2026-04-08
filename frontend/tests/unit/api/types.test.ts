import { describe, it, expect } from 'vitest';
import type { Match, Stream, Team, Player, Advancement } from '@/api/types';

describe('API Types Compliance', () => {
  describe('Match Interface', () => {
    it('should have correct field names for team IDs', () => {
      const match: Match = {
        id: 'test',
        stage: 'swiss',
        round: 'Round 1',
        teamAId: 'team-a',
        teamBId: 'team-b',
        scoreA: 1,
        scoreB: 0,
        status: 'upcoming',
      };
      expect(match.teamAId).toBeDefined();
      expect(match.teamBId).toBeDefined();
      expect(match.scoreA).toBeDefined();
      expect(match.scoreB).toBeDefined();
    });

    it('should have correct status enum values', () => {
      const validStatuses: Match['status'][] = ['upcoming', 'ongoing', 'finished'];
      validStatuses.forEach(status => {
        const match: Match = {
          id: 'test',
          stage: 'swiss',
          round: 'Round 1',
          scoreA: 0,
          scoreB: 0,
          status,
        };
        expect(match.status).toBe(status);
      });
    });

    it('should have winnerId field', () => {
      const match: Match = {
        id: 'test',
        stage: 'swiss',
        round: 'Round 1',
        scoreA: 0,
        scoreB: 0,
        status: 'finished',
        winnerId: 'team-a',
      };
      expect(match.winnerId).toBe('team-a');
    });
  });

  describe('Stream Interface', () => {
    it('should have correct field names', () => {
      const stream: Stream = {
        id: '1',
        title: 'Test Stream',
        url: 'https://example.com/stream',
        isLive: true,
      };
      expect(stream.url).toBeDefined();
      expect(stream.isLive).toBe(true);
    });
  });

  describe('Team Interface', () => {
    it('should have players field instead of members', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Team A',
        players: [],
      };
      expect(team.players).toBeDefined();
    });
  });

  describe('Player Interface', () => {
    it('should have correct position enum values', () => {
      const validPositions: Player['position'][] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      validPositions.forEach(position => {
        const player: Player = {
          id: 'player-1',
          nickname: 'Player 1',
          position,
          teamId: 'team-1',
        };
        expect(player.position).toBe(position);
      });
    });
  });

  describe('Advancement Interface', () => {
    it('should have correct structure', () => {
      const advancement: Advancement = {
        winners2_0: ['team-1', 'team-2'],
        winners2_1: ['team-3', 'team-4'],
        losersBracket: ['team-5', 'team-6'],
        eliminated3rd: ['team-7'],
        eliminated0_3: ['team-8'],
      };
      expect(advancement.winners2_0).toBeInstanceOf(Array);
      expect(advancement.winners2_1).toBeInstanceOf(Array);
      expect(advancement.losersBracket).toBeInstanceOf(Array);
      expect(advancement.eliminated3rd).toBeInstanceOf(Array);
      expect(advancement.eliminated0_3).toBeInstanceOf(Array);
    });
  });
});
