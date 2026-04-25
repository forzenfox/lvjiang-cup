import type { Team, Match, SwissAdvancementResult, EliminationBracket } from '@/types';

/**
 * 获取晋级成功的队伍列表
 * @param allTeams - 所有队伍
 * @param advancement - 晋级信息
 * @returns 晋级成功的队伍
 */
export function getQualifiedTeams(allTeams: Team[], advancement: SwissAdvancementResult): Team[] {
  return allTeams.filter(team => advancement.top8.includes(team.id));
}

/**
 * 获取同一轮次中已使用的队伍ID
 * @param matches - 所有比赛
 * @param currentMatchId - 当前编辑的比赛ID
 * @param currentBracket - 当前轮次（quarterfinals/semifinals/finals）
 * @returns 已使用的队伍ID集合
 */
export function getUsedTeamIds(
  matches: Match[],
  currentMatchId: string,
  currentBracket: EliminationBracket
): Set<string> {
  const usedIds = new Set<string>();
  matches
    .filter(m => m.id !== currentMatchId && m.eliminationBracket === currentBracket)
    .forEach(m => {
      if (m.teamAId) usedIds.add(m.teamAId);
      if (m.teamBId) usedIds.add(m.teamBId);
    });
  return usedIds;
}
