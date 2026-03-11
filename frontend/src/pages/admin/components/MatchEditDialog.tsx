import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, PlayCircle, CheckCircle } from 'lucide-react';
import { formatDateTime, toDateTimeLocal, fromDateTimeLocal } from '@/utils/datetime';

interface MatchEditDialogProps {
  match: Match;
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (match: Match) => void;
}

const MatchEditDialog: React.FC<MatchEditDialogProps> = ({
  match,
  teams,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Match>(match);

  useEffect(() => {
    setFormData(match);
  }, [match, isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof Match>(field: K, value: Match[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.status === 'finished' && !formData.winnerId) {
      if (formData.scoreA > formData.scoreB) {
        formData.winnerId = formData.teamAId;
      } else if (formData.scoreB > formData.scoreA) {
        formData.winnerId = formData.teamBId;
      }
    }
    onSave(formData);
    onClose();
  };

  const handleQuickStatus = (status: MatchStatus) => {
    const updated = { ...formData, status };
    if (status === 'finished') {
      if (updated.scoreA > updated.scoreB) {
        updated.winnerId = updated.teamAId;
      } else if (updated.scoreB > updated.scoreA) {
        updated.winnerId = updated.teamBId;
      }
    }
    setFormData(updated);
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || '待定';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white text-lg">编辑比赛</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">比赛时间</label>
            <input
              type="datetime-local"
              value={formData.startTime ? toDateTimeLocal(formData.startTime) : ''}
              onChange={(e) => handleChange('startTime', fromDateTimeLocal(e.target.value))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">状态</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={formData.status === 'upcoming' ? 'default' : 'outline'}
                onClick={() => handleQuickStatus('upcoming')}
                className={formData.status === 'upcoming' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
              >
                未开始
              </Button>
              <Button
                size="sm"
                variant={formData.status === 'ongoing' ? 'default' : 'outline'}
                onClick={() => handleQuickStatus('ongoing')}
                className={formData.status === 'ongoing' ? 'bg-green-600' : 'border-gray-600 text-gray-300'}
              >
                <PlayCircle className="w-4 h-4 mr-1" />
                进行中
              </Button>
              <Button
                size="sm"
                variant={formData.status === 'finished' ? 'default' : 'outline'}
                onClick={() => handleQuickStatus('finished')}
                className={formData.status === 'finished' ? 'bg-gray-600' : 'border-gray-600 text-gray-300'}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                已结束
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">队伍 A</label>
              <select
                value={formData.teamAId}
                onChange={(e) => handleChange('teamAId', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              >
                <option value="">选择队伍</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === formData.teamBId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">队伍 B</label>
              <select
                value={formData.teamBId}
                onChange={(e) => handleChange('teamBId', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
              >
                <option value="">选择队伍</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id} disabled={t.id === formData.teamAId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">比分 A</label>
              <input
                type="number"
                min="0"
                value={formData.scoreA}
                onChange={(e) => handleChange('scoreA', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm text-center font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">比分 B</label>
              <input
                type="number"
                min="0"
                value={formData.scoreB}
                onChange={(e) => handleChange('scoreB', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm text-center font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchEditDialog;
