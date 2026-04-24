import { validateImportData } from '../../src/modules/teams/utils/validate-import.util';
import { ImportTeamDto, ImportMemberDto } from '../../src/modules/teams/dto/import';

describe('validateImportData', () => {
  const createMember = (
    position: string,
    isCaptain = false,
    rowIndex?: number,
  ): ImportMemberDto => ({
    rowIndex: rowIndex || 4,
    nickname: '测试队员',
    avatarUrl: 'https://example.com/avatar.png',
    position: position as any,
    gameId: 'TestPlayer',
    bio: '简介',
    championPoolStr: '亚索',
    rating: 75,
    isCaptainStr: isCaptain ? '是' : '否',
    isCaptain,
    level: 'B',
    liveRoom: '123456',
    personalBio: '个人简介',
  });

  const createTeam = (name: string, members: ImportMemberDto[]): ImportTeamDto => ({
    name,
    logoUrl: 'https://example.com/logo.png',
    battleCry: '我们是冠军',
    members,
  });

  describe('战队成员数量校验', () => {
    it('应该允许战队只有 1 名队员', () => {
      const teams = [createTeam('战队 A', [createMember('TOP')])];
      const result = validateImportData(teams, 4);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该允许战队有 2-4 名队员', () => {
      const teams = [
        createTeam('战队 A', [createMember('TOP'), createMember('JUNGLE')]),
        createTeam('战队 B', [createMember('TOP'), createMember('JUNGLE'), createMember('MID')]),
        createTeam('战队 C', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
        ]),
      ];
      const result = validateImportData(teams, 12);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该允许战队有完整的 5 名队员', () => {
      const teams = [
        createTeam('战队 A', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
          createMember('SUPPORT'),
        ]),
      ];
      const result = validateImportData(teams, 8);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝没有队员的战队', () => {
      const teams = [
        {
          name: '空战队',
          logoUrl: 'https://example.com/logo.png',
          battleCry: '我们是冠军',
          members: [],
        } as ImportTeamDto,
      ];
      const result = validateImportData(teams, 4);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some((e) => e.field === 'members' || e.message.includes('至少需要 1 名队员')),
      ).toBe(true);
    });

    it('应该拒绝超过 5 名队员的战队', () => {
      const teams = [
        createTeam('超编战队', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
          createMember('SUPPORT'),
          createMember('TOP', false, 10), // 第 6 人，位置重复
        ]),
      ];
      const result = validateImportData(teams, 9);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'members')).toBe(true);
      expect(result.errors.some((e) => e.message.includes('最多 5 名队员'))).toBe(true);
    });
  });

  describe('位置唯一性校验', () => {
    it('应该允许每个位置只出现一次', () => {
      const teams = [
        createTeam('正常战队', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
          createMember('SUPPORT'),
        ]),
      ];
      const result = validateImportData(teams, 8);
      expect(result.valid).toBe(true);
    });

    it('应该拒绝同一战队内位置重复', () => {
      const teams = [
        createTeam('重复位置战队', [
          createMember('TOP'),
          createMember('TOP', false, 5), // 重复
          createMember('MID'),
        ]),
      ];
      const result = validateImportData(teams, 6);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === '位置' && e.message.includes('不能重复'))).toBe(
        true,
      );
    });

    it('应该允许不同战队有相同位置', () => {
      const teams = [
        createTeam('战队 A', [createMember('TOP')]),
        createTeam('战队 B', [createMember('TOP')]), // 允许
      ];
      const result = validateImportData(teams, 5);
      expect(result.valid).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该支持混合情况：部分战队 5 人，部分不足 5 人', () => {
      const teams = [
        createTeam('完整战队', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
          createMember('SUPPORT'),
        ]),
        createTeam('3 人战队', [createMember('TOP'), createMember('JUNGLE'), createMember('MID')]),
        createTeam('2 人战队', [createMember('TOP'), createMember('JUNGLE')]),
      ];
      const result = validateImportData(teams, 13);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该支持所有战队都不足 5 人', () => {
      const teams = [
        createTeam('3 人战队', [createMember('TOP'), createMember('JUNGLE'), createMember('MID')]),
        createTeam('4 人战队', [
          createMember('TOP'),
          createMember('JUNGLE'),
          createMember('MID'),
          createMember('ADC'),
        ]),
      ];
      const result = validateImportData(teams, 10);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
