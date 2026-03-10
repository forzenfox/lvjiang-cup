import { useState } from 'react';
import { Match, Team } from '../../../types';

export function useMatchFilter(teams: Team[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filterMatches = (list: Match[]): Match[] => {
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter(m => {
      const teamA = teams.find(t => t.id === m.teamAId)?.name.toLowerCase() || '';
      const teamB = teams.find(t => t.id === m.teamBId)?.name.toLowerCase() || '';
      return teamA.includes(lower) || teamB.includes(lower);
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    filterMatches,
  };
}
