import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '../../../types';
import { Button } from '../../../components/ui/button';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Save, X, Edit, Check, PlayCircle, Trophy, Crown, ArrowRight, RotateCcw } from 'lucide-react';
import { formatDateTime, toDateTimeLocal, fromDateTimeLocal } from '../../../utils/datetime';

interface MatchRowProps {
  match: Match;
  teams: Team[];
  onUpdate: (updatedMatch: Match) => void;
  loading?: boolean;
  fixedSwissRecord?: string;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, teams, onUpdate, loading, fixedSwissRecord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Match>(match);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Sync formData when match prop changes (e.g. external update)
  useEffect(() => {
    setFormData(match);
  }, [match]);

  const handleChange = <K extends keyof Match>(field: K, value: Match[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Auto-calculate winner if finished
    const updated = { ...formData };

    // Apply fixed swiss record if provided
    if (fixedSwissRecord && updated.stage === 'swiss') {
      updated.swissRecord = fixedSwissRecord;
    }

    if (updated.status === 'finished' && !updated.winnerId) {
      if (updated.scoreA > updated.scoreB) updated.winnerId = updated.teamAId;
      else if (updated.scoreB > updated.scoreA) updated.winnerId = updated.teamBId;
    }

    onUpdate(updated);
    setIsEditing(false);
  };

  const handleQuickStatus = (status: MatchStatus) => {
    const updated = { ...match, status };

    // Auto-finish logic
    if (status === 'finished') {
      if (match.scoreA > match.scoreB) updated.winnerId = match.teamAId;
      else if (match.scoreB > match.scoreA) updated.winnerId = match.teamBId;
    }

    onUpdate(updated);
  };

  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      teamAId: '',
      teamBId: '',
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming' as MatchStatus,
      winnerId: undefined,
    }));
  };

  const hasUnsavedChanges = () => {
    return (
      formData.teamAId !== match.teamAId ||
      formData.teamBId !== match.teamBId ||
      formData.scoreA !== match.scoreA ||
      formData.scoreB !== match.scoreB ||
      formData.status !== match.status ||
      formData.startTime !== match.startTime ||
      formData.swissRecord !== match.swissRecord
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmCancel = () => {
    setFormData(match);
    setIsEditing(false);
    setShowConfirmDialog(false);
  };

  const handleDismissDialog = () => {
    setShowConfirmDialog(false);
  };



  // Helper to get team name
  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'TBD';

  if (isEditing) {
    return (
      <div className="bg-gray-800/50 border border-blue-500/50 rounded-lg p-4 mb-2 animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Time */}
          <div className="md:col-span-3 space-y-2">
            <input
              type="datetime-local"
              value={formData.startTime ? toDateTimeLocal(formData.startTime) : ''}
              onChange={(e) => handleChange('startTime', fromDateTimeLocal(e.target.value))}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white
                [color-scheme:dark]
                [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[0.6]
                [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />

            {/* Swiss Stage Specific Fields */}
            {match.stage === 'swiss' && (
              <div className="flex gap-2">
                {!fixedSwissRecord && (
                  <select
                    value={formData.swissRecord || ''}
                    onChange={(e) => handleChange('swissRecord', e.target.value)}
                    className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                  >
                    <option value="">Record</option>
                    <option value="0-0">0-0</option>
                    <option value="1-0">1-0</option>
                    <option value="0-1">0-1</option>
                    <option value="1-1">1-1</option>
                    <option value="0-2">0-2</option>
                    <option value="1-2">1-2</option>
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Teams & Scores */}
          <div className="md:col-span-5 flex items-center justify-center gap-2">
            <div className="flex flex-col gap-1 w-full">
              <select
                value={formData.teamAId}
                onChange={(e) => handleChange('teamAId', e.target.value)}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              >
                <option value="">Select Team A</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="number"
                value={formData.scoreA}
                onChange={(e) => handleChange('scoreA', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center text-white font-bold"
              />
            </div>

            <span className="text-gray-500 font-bold">VS</span>

            <div className="flex flex-col gap-1 w-full">
              <select
                value={formData.teamBId}
                onChange={(e) => handleChange('teamBId', e.target.value)}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
              >
                <option value="">Select Team B</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input
                type="number"
                value={formData.scoreB}
                onChange={(e) => handleChange('scoreB', parseInt(e.target.value))}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-center text-white font-bold"
              />
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as MatchStatus)}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            >
              <option value="upcoming">未开始</option>
              <option value="ongoing">进行中</option>
              <option value="finished">已结束</option>
            </select>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button size="sm" onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset} title="重置" className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 确认弹框 */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="放弃修改"
          message="有未保存的更改，确定要放弃修改吗？"
          confirmText="确定放弃"
          cancelText="继续编辑"
          onConfirm={handleConfirmCancel}
          onCancel={handleDismissDialog}
        />
      </div>
    );
  }

  // View Mode
  const isWinnerA = match.winnerId === match.teamAId;
  const isWinnerB = match.winnerId === match.teamBId;

  return (
    <div className="bg-gray-800/30 hover:bg-gray-800/50 border-b border-gray-700/50 p-4 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Time */}
        <div className="md:col-span-3 text-sm">
          <div className="text-gray-300 font-medium">{formatDateTime(match.startTime)}</div>
          {match.stage === 'swiss' && match.swissRecord && !fixedSwissRecord && (
            <div className="mt-1">
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800">
                {match.swissRecord}
              </span>
            </div>
          )}

          {match.stage === 'elimination' && (
            <div className="text-xs text-yellow-500/70 mt-1 flex items-center gap-1 group relative cursor-help">
              <span>
                {match.eliminationBracket === 'winners' ? '胜者组' : match.eliminationBracket === 'losers' ? '败者组' : '总决赛'}
              </span>
              {match.nextMatchId && (
                <>
                  <ArrowRight className="w-3 h-3" />
                  <span className="underline decoration-dashed decoration-yellow-500/50">
                    {match.nextMatchId}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Teams & Scores */}
        <div className="md:col-span-5 flex items-center justify-center gap-4">
          {/* Team A */}
          <div className={`flex-1 text-right flex items-center justify-end gap-2 ${isWinnerA ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
            {isWinnerA && <Crown className="w-3 h-3 text-yellow-500" />}
            {getTeamName(match.teamAId)}
          </div>

          {/* Score */}
          <div className="bg-gray-900 px-3 py-1 rounded text-white font-mono font-bold tracking-widest min-w-[60px] text-center border border-gray-700">
            {match.scoreA} - {match.scoreB}
          </div>

          {/* Team B */}
          <div className={`flex-1 text-left flex items-center justify-start gap-2 ${isWinnerB ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}>
            {getTeamName(match.teamBId)}
            {isWinnerB && <Crown className="w-3 h-3 text-yellow-500" />}
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-2 text-center">
          <span className={`
             inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             ${match.status === 'finished' ? 'bg-gray-700 text-gray-300' :
              match.status === 'ongoing' ? 'bg-green-900/50 text-green-400 animate-pulse' :
                'bg-blue-900/30 text-blue-400'}
           `}>
            {match.status === 'finished' ? '已结束' : match.status === 'ongoing' ? '进行中' : '未开始'}
          </span>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-2">
          {match.status === 'upcoming' && (
            <Button size="sm" variant="ghost" onClick={() => handleQuickStatus('ongoing')} title="Start Match" className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
              <PlayCircle className="w-4 h-4" />
            </Button>
          )}

          {match.status === 'ongoing' && (
            <Button size="sm" variant="ghost" onClick={() => handleQuickStatus('finished')} title="End Match" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
              <Check className="w-4 h-4" />
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} title="Edit">
            <Edit className="w-4 h-4 text-blue-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchRow;
