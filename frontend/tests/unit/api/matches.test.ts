import { describe, it, expect, vi } from 'vitest';
import { clearScores } from '@/api/matches';
import apiClient from '@/api/axios';

vi.mock('@/api/axios');

describe('Matches API', () => {
  describe('clearScores', () => {
    it('should call DELETE /admin/matches/:id/scores', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 'match-1', scoreA: 0, scoreB: 0 },
        },
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      await clearScores('match-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/admin/matches/match-1/scores');
    });

    it('should throw error when request fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Failed to clear scores',
        },
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      await expect(clearScores('match-1')).rejects.toThrow('Failed to clear scores');
    });
  });
});
