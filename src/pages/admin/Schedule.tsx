import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { mockService } from '../../mock/service';
import { Match, Team, MatchStage, MatchStatus } from '../../types';
import ScheduleFilterBar from './components/ScheduleFilterBar';
import MatchRow from './components/MatchRow';

const AdminSchedule: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    stage: 'all' as MatchStage | 'all',
    status: 'all' as MatchStatus | 'all',
    search: '',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        mockService.getMatches(),
        mockService.getTeams()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (updatedMatch: Match) => {
    setLoading(true);
    try {
      // 1. Update the current match
      await mockService.updateMatch(updatedMatch);

      // 2. Check for Auto-Advance (Elimination Bracket)
      if (
        updatedMatch.stage === 'elimination' && 
        updatedMatch.status === 'finished' && 
        updatedMatch.winnerId && 
        updatedMatch.nextMatchId
      ) {
        // Find next match
        const nextMatch = matches.find(m => m.id === updatedMatch.nextMatchId);
        
        if (nextMatch) {
          // Determine which slot to fill
          const slotField = updatedMatch.nextMatchSlot === 'teamA' ? 'teamAId' : 
                            updatedMatch.nextMatchSlot === 'teamB' ? 'teamBId' : null;
          
          if (slotField) {
            // Check if slot is empty or needs update
            if (nextMatch[slotField] !== updatedMatch.winnerId) {
              const newNextMatch = { ...nextMatch, [slotField]: updatedMatch.winnerId };
              await mockService.updateMatch(newNextMatch);
              console.log(`Auto-advanced winner ${updatedMatch.winnerId} to match ${nextMatch.id} slot ${slotField}`);
            }
          }
        }
      }

      // 3. Reload data to reflect changes
      await loadData();
      
    } catch (error) {
      console.error('Failed to update match', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering Logic
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Stage Filter
      if (filters.stage !== 'all' && match.stage !== filters.stage) return false;
      
      // Status Filter
      if (filters.status !== 'all' && match.status !== filters.status) return false;
      
      // Search Filter
      if (filters.search) {
        const teamA = teams.find(t => t.id === match.teamAId)?.name.toLowerCase() || '';
        const teamB = teams.find(t => t.id === match.teamBId)?.name.toLowerCase() || '';
        const searchLower = filters.search.toLowerCase();
        return teamA.includes(searchLower) || teamB.includes(searchLower) || match.round.toLowerCase().includes(searchLower);
      }
      
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return filters.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [matches, teams, filters]);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">赛程管理</h1>
          <div className="text-sm text-gray-400">
            共 {filteredMatches.length} 场比赛
          </div>
        </div>
        
        <ScheduleFilterBar 
          filters={filters} 
          onFilterChange={setFilters} 
        />

        <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-lg border border-gray-800">
          {loading && matches.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              加载中...
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="flex flex-col">
              {filteredMatches.map(match => (
                <MatchRow 
                  key={match.id} 
                  match={match} 
                  teams={teams} 
                  onUpdate={handleMatchUpdate}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              未找到匹配的比赛
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
