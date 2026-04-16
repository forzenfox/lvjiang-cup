import type { Match } from '@/types';

export function isMatchAssigned(
  match: Match
): match is Match & { teamAId: string; teamBId: string } {
  return Boolean(match.teamAId && match.teamBId);
}

export function isMatchFinished(
  match: Match
): match is Match & { status: 'finished'; winnerId: string } {
  return match.status === 'finished' && Boolean(match.winnerId);
}

export function getSafeTeamId(
  teamId: string | undefined | null,
  defaultValue: string = ''
): string {
  return teamId || defaultValue;
}
