import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { mockService } from '../../mock/service';
import { Match, Team } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Save } from 'lucide-react';
import { format } from 'date-fns';

const AdminSchedule: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [matchesData, teamsData] = await Promise.all([
      mockService.getMatches(),
      mockService.getTeams()
    ]);
    setMatches(matchesData);
    setTeams(teamsData);
  };

  const handleMatchUpdate = async (match: Match) => {
    setLoading(true);
    try {
      // Auto-determine winner if finished and no winner set
      let updatedMatch = { ...match };
      if (match.status === 'finished' && !match.winnerId) {
        if (match.scoreA > match.scoreB) updatedMatch.winnerId = match.teamAId;
        else if (match.scoreB > match.scoreA) updatedMatch.winnerId = match.teamBId;
      }

      await mockService.updateMatch(updatedMatch);
      // No need to reload as we updated local state via input changes, but good practice to sync
      loadData();
    } catch (error) {
      console.error('Failed to update match', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id: string, field: keyof Match, value: any) => {
    setMatches(matches.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-white mb-6">赛程管理</h1>
      
      <div className="space-y-4">
        {matches.map(match => (
          <Card key={match.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Round & Time */}
                <div className="md:col-span-3 space-y-2">
                  <input
                    value={match.round}
                    onChange={(e) => handleInputChange(match.id, 'round', e.target.value)}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                    placeholder="轮次名称"
                  />
                  <input
                    type="datetime-local"
                    value={match.startTime ? new Date(match.startTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange(match.id, 'startTime', new Date(e.target.value).toISOString())}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                  />
                  <select
                    value={match.status}
                    onChange={(e) => handleInputChange(match.id, 'status', e.target.value)}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                  >
                    <option value="upcoming">未开始</option>
                    <option value="ongoing">进行中</option>
                    <option value="finished">已结束</option>
                  </select>
                </div>

                {/* Teams & Scores */}
                <div className="md:col-span-6 grid grid-cols-3 gap-2 items-center">
                  {/* Team A */}
                  <div className="text-center space-y-2">
                    <select
                      value={match.teamAId}
                      onChange={(e) => handleInputChange(match.id, 'teamAId', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                    >
                      <option value="">选择战队</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input
                      type="number"
                      value={match.scoreA}
                      onChange={(e) => handleInputChange(match.id, 'scoreA', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-700 rounded text-white text-center mx-auto block"
                    />
                  </div>

                  <div className="text-center text-gray-500 font-bold">VS</div>

                  {/* Team B */}
                  <div className="text-center space-y-2">
                    <select
                      value={match.teamBId}
                      onChange={(e) => handleInputChange(match.id, 'teamBId', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-white text-sm"
                    >
                      <option value="">Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input
                      type="number"
                      value={match.scoreB}
                      onChange={(e) => handleInputChange(match.id, 'scoreB', parseInt(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-700 rounded text-white text-center mx-auto block"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-3 flex justify-end">
                  <Button 
                    onClick={() => handleMatchUpdate(match)} 
                    disabled={loading}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Save className="w-4 h-4 mr-2" /> 更新
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
