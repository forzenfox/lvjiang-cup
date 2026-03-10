import React, { useState } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
import { swissRoundSlots, SwissRoundSlot, getRoundFormat } from './swissRoundSlots';

interface SwissAdvancement {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
}

interface SwissStageVisualEditorProps {
  matches: Match[];
  teams: Team[];
  advancement: SwissAdvancement;
  onMatchUpdate: (match: Match) => void;
  onAdvancementUpdate: (advancement: SwissAdvancement) => void;
  onMatchCreate?: (match: Omit<Match, 'id'>) => void;
  onMatchDelete?: (matchId: string) => void;
}

interface TeamLogoProps {
  team?: Team;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ team }) => {
  if (!team?.logo) return <div className="w-5 h-5 rounded-full bg-gray-700" />;
  return <img src={team.logo} alt={team.name} className="w-5 h-5 rounded-full object-cover" />;
};

interface MatchStatusBadgeProps {
  status: MatchStatus;
}

const MatchStatusBadge: React.FC<MatchStatusBadgeProps> = ({ status }) => {
  const styles = {
    upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/30',
    ongoing: 'bg-green-900/50 text-green-400 border-green-700/30 animate-pulse',
    finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30'
  };
  
  return (
    <span className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${styles[status]}`}>
      {status === 'upcoming' ? '未开始' : status === 'ongoing' ? '进行中' : '已结束'}
    </span>
  );
};

interface FixedSlotMatchCardProps {
  match: Match | null;
  teams: Team[];
  slot: SwissRoundSlot;
  slotIndex: number;
  onUpdate: (match: Match) => void;
  onCreate?: (match: Omit<Match, 'id'>) => void;
}

const FixedSlotMatchCard: React.FC<FixedSlotMatchCardProps> = ({ match, teams, slot, slotIndex, onUpdate, onCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Match>>({
    teamAId: match?.teamAId || '',
    teamBId: match?.teamBId || '',
    scoreA: match?.scoreA || 0,
    scoreB: match?.scoreB || 0,
    winnerId: match?.winnerId || null,
    status: match?.status || 'upcoming',
    startTime: match?.startTime || '',
  });

  const teamA = teams.find(t => t.id === formData.teamAId);
  const teamB = teams.find(t => t.id === formData.teamBId);
  const isFinished = formData.status === 'finished';
  const isEmpty = !match;

  const handleClick = () => {
    if (isEmpty && onCreate) {
      // 空槽位：创建新比赛
      setIsEditing(true);
    } else if (!isEmpty) {
      // 已有比赛：编辑现有比赛
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!formData.teamAId || !formData.teamBId) return;

    const newMatch: Match = {
      id: match?.id || `new-${slot.swissRecord}-${slotIndex}`,
      teamAId: formData.teamAId!,
      teamBId: formData.teamBId!,
      scoreA: formData.scoreA || 0,
      scoreB: formData.scoreB || 0,
      winnerId: formData.status === 'finished' 
        ? (formData.scoreA! > formData.scoreB! ? formData.teamAId : formData.teamBId)
        : null,
      round: slot.roundName,
      status: formData.status || 'upcoming',
      startTime: formData.startTime || '',
      stage: 'swiss',
      swissRecord: slot.swissRecord,
    };

    if (match) {
      onUpdate(newMatch);
    } else if (onCreate) {
      onCreate(newMatch);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      teamAId: match?.teamAId || '',
      teamBId: match?.teamBId || '',
      scoreA: match?.scoreA || 0,
      scoreB: match?.scoreB || 0,
      status: match?.status || 'upcoming',
      startTime: match?.startTime || '',
    });
  };

  if (isEmpty && !isEditing) {
    return (
      <div 
        className="bg-gray-800/40 border-2 border-dashed border-gray-700 rounded-lg p-2.5 cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/60 transition-colors min-h-[80px] flex items-center justify-center"
        onClick={handleClick}
      >
        <div className="text-center text-gray-500 text-sm">
          <span className="block text-lg mb-1">+</span>
          等待对阵
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-2.5">
        <div className="flex flex-col gap-2">
          <select
            value={formData.teamAId}
            onChange={(e) => setFormData(prev => ({ ...prev, teamAId: e.target.value }))}
            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
          >
            <option value="">选择队伍A</option>
            {teams.map(t => (
              <option key={t.id} value={t.id} disabled={t.id === formData.teamBId}>
                {t.name}
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={formData.scoreA}
              onChange={(e) => setFormData(prev => ({ ...prev, scoreA: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm text-center"
            />
            <span className="text-gray-500">:</span>
            <input
              type="number"
              min="0"
              value={formData.scoreB}
              onChange={(e) => setFormData(prev => ({ ...prev, scoreB: parseInt(e.target.value) || 0 }))}
              className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm text-center"
            />
          </div>

          <select
            value={formData.teamBId}
            onChange={(e) => setFormData(prev => ({ ...prev, teamBId: e.target.value }))}
            className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
          >
            <option value="">选择队伍B</option>
            {teams.map(t => (
              <option key={t.id} value={t.id} disabled={t.id === formData.teamAId}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="flex gap-1 mt-1">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
            >
              取消
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden cursor-pointer hover:border-blue-500/50"
      onClick={handleClick}
    >
      <MatchStatusBadge status={match?.status || 'upcoming'} />
      {match?.startTime && (
        <div className="absolute top-0 left-0 bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-br flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDateTime(match.startTime)}</span>
        </div>
      )}
      <div className="flex flex-col gap-2 pt-4">
        <div className={`flex items-center justify-between ${match?.winnerId === match?.teamAId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            <TeamLogo team={teamA} />
            <span className={`text-sm font-medium ${match?.winnerId === match?.teamAId ? 'text-yellow-400' : 'text-gray-300'}`}>
              {teamA?.name || '待定'}
            </span>
          </div>
          <span className={`text-sm font-bold ${match?.winnerId === match?.teamAId ? 'text-yellow-400' : 'text-gray-500'}`}>
            {match?.scoreA ?? 0}
          </span>
        </div>

        <div className={`flex items-center justify-between ${match?.winnerId === match?.teamBId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex items-center gap-2">
            <TeamLogo team={teamB} />
            <span className={`text-sm font-medium ${match?.winnerId === match?.teamBId ? 'text-yellow-400' : 'text-gray-300'}`}>
              {teamB?.name || '待定'}
            </span>
          </div>
          <span className={`text-sm font-bold ${match?.winnerId === match?.teamBId ? 'text-yellow-400' : 'text-gray-500'}`}>
            {match?.scoreB ?? 0}
          </span>
        </div>
      </div>
    </Card>
  );
};

interface RoundColumnProps {
  slot: SwissRoundSlot;
  matches: Match[];
  teams: Team[];
  className?: string;
  onMatchUpdate: (match: Match) => void;
  onMatchCreate?: (match: Omit<Match, 'id'>) => void;
}

const RoundColumn: React.FC<RoundColumnProps> = ({ slot, matches, teams, className, onMatchUpdate, onMatchCreate }) => {
  const slots = Array.from({ length: slot.maxMatches }, (_, i) => {
    const match = matches[i] || null;
    return { match, index: i };
  });

  const roundFormat = getRoundFormat(slot.swissRecord);

  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${className}`}>
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{slot.roundName}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-gray-500">({slot.swissRecord})</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            roundFormat === 'BO1'
              ? 'bg-green-600/20 text-green-400'
              : 'bg-blue-600/20 text-blue-400'
          }`}>
            {roundFormat}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 min-h-[60px]">
        {slots.map(({ match, index }) => (
          <FixedSlotMatchCard
            key={`${slot.swissRecord}-${index}`}
            match={match}
            teams={teams}
            slot={slot}
            slotIndex={index}
            onUpdate={onMatchUpdate}
            onCreate={onMatchCreate}
          />
        ))}
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  type: 'qualified' | 'eliminated' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, children, onClick }) => {
  const styles = {
    qualified: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 cursor-pointer',
    eliminated: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 cursor-pointer',
    danger: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 cursor-pointer'
  };

  return (
    <div 
      className={`px-3 py-1.5 rounded border text-xs font-medium text-center ${styles[type]}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface TeamListProps {
  teams: Team[];
  ids: string[];
  onRemove?: (id: string) => void;
}

const TeamList: React.FC<TeamListProps> = ({ teams, ids, onRemove }) => {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {ids.map(id => {
        const team = teams.find(t => t.id === id);
        if (!team) return null;
        return (
          <div key={id} className="flex items-center justify-between text-sm text-gray-300 bg-gray-800/50 p-1.5 rounded group">
            <div className="flex items-center gap-2">
              <TeamLogo team={team} />
              <span>{team.name}</span>
            </div>
            {onRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface AdvancementEditorProps {
  teams: Team[];
  advancement: SwissAdvancement;
  onUpdate: (advancement: SwissAdvancement) => void;
}

const AdvancementEditor: React.FC<AdvancementEditorProps> = ({ teams, advancement, onUpdate }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const handleAddTeam = (field: keyof SwissAdvancement) => {
    if (!selectedTeam || advancement[field].includes(selectedTeam)) return;
    onUpdate({
      ...advancement,
      [field]: [...advancement[field], selectedTeam]
    });
    setEditingField(null);
    setSelectedTeam('');
  };

  const handleRemoveTeam = (field: keyof SwissAdvancement, teamId: string) => {
    onUpdate({
      ...advancement,
      [field]: advancement[field].filter(id => id !== teamId)
    });
  };

  const availableTeams = teams.filter(t => 
    !Object.values(advancement).flat().includes(t.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <StatusBadge type="qualified" onClick={() => setEditingField('winners2_0')}>
          2-0 晋级 (胜者组)
        </StatusBadge>
        <TeamList teams={teams} ids={advancement.winners2_0} onRemove={(id) => handleRemoveTeam('winners2_0', id)} />
        {editingField === 'winners2_0' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            onBlur={() => handleAddTeam('winners2_0')}
            className="mt-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            autoFocus
          >
            <option value="">选择队伍</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <StatusBadge type="qualified" onClick={() => setEditingField('winners2_1')}>
          2-1 晋级 (胜者组)
        </StatusBadge>
        <TeamList teams={teams} ids={advancement.winners2_1} onRemove={(id) => handleRemoveTeam('winners2_1', id)} />
        {editingField === 'winners2_1' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            onBlur={() => handleAddTeam('winners2_1')}
            className="mt-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            autoFocus
          >
            <option value="">选择队伍</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <StatusBadge type="danger" onClick={() => setEditingField('losersBracket')}>
          晋级败者组
        </StatusBadge>
        <TeamList teams={teams} ids={advancement.losersBracket} onRemove={(id) => handleRemoveTeam('losersBracket', id)} />
        {editingField === 'losersBracket' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            onBlur={() => handleAddTeam('losersBracket')}
            className="mt-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            autoFocus
          >
            <option value="">选择队伍</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <StatusBadge type="eliminated" onClick={() => setEditingField('eliminated3rd')}>
          积分第三淘汰
        </StatusBadge>
        <TeamList teams={teams} ids={advancement.eliminated3rd} onRemove={(id) => handleRemoveTeam('eliminated3rd', id)} />
        {editingField === 'eliminated3rd' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            onBlur={() => handleAddTeam('eliminated3rd')}
            className="mt-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            autoFocus
          >
            <option value="">选择队伍</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <StatusBadge type="eliminated" onClick={() => setEditingField('eliminated0_3')}>
          0-3 淘汰
        </StatusBadge>
        <TeamList teams={teams} ids={advancement.eliminated0_3} onRemove={(id) => handleRemoveTeam('eliminated0_3', id)} />
        {editingField === 'eliminated0_3' && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            onBlur={() => handleAddTeam('eliminated0_3')}
            className="mt-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
            autoFocus
          >
            <option value="">选择队伍</option>
            {availableTeams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

const SwissStageVisualEditor: React.FC<SwissStageVisualEditorProps> = ({
  matches,
  teams,
  advancement,
  onMatchUpdate,
  onAdvancementUpdate,
  onMatchCreate,
}) => {
  const matchesByRecord = swissRoundSlots.reduce((acc, slot) => {
    acc[slot.swissRecord] = matches.filter(m => m.swissRecord === slot.swissRecord);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-8 min-w-[1400px] p-4">
        <div className="flex gap-8 flex-1">
          <div className="flex flex-col gap-4 w-64">
            <RoundColumn 
              slot={swissRoundSlots[0]} 
              matches={matchesByRecord['0-0'] || []} 
              teams={teams} 
              onMatchUpdate={onMatchUpdate}
              onMatchCreate={onMatchCreate}
            />
          </div>

          <div className="flex flex-col gap-8 w-64 mt-8">
            <RoundColumn 
              slot={swissRoundSlots[1]} 
              matches={matchesByRecord['1-0'] || []} 
              teams={teams} 
              onMatchUpdate={onMatchUpdate}
              onMatchCreate={onMatchCreate}
            />
            <RoundColumn 
              slot={swissRoundSlots[2]} 
              matches={matchesByRecord['0-1'] || []} 
              teams={teams} 
              onMatchUpdate={onMatchUpdate}
              onMatchCreate={onMatchCreate}
            />
          </div>

          <div className="flex flex-col gap-8 w-64">
            <RoundColumn 
              slot={swissRoundSlots[3]} 
              matches={matchesByRecord['1-1'] || []} 
              teams={teams} 
              onMatchUpdate={onMatchUpdate}
              onMatchCreate={onMatchCreate}
            />
            <div className="mt-4">
              <RoundColumn 
                slot={swissRoundSlots[4]} 
                matches={matchesByRecord['0-2'] || []} 
                teams={teams} 
                onMatchUpdate={onMatchUpdate}
                onMatchCreate={onMatchCreate}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 w-64 mt-16">
            <RoundColumn 
              slot={swissRoundSlots[5]} 
              matches={matchesByRecord['1-2'] || []} 
              teams={teams} 
              onMatchUpdate={onMatchUpdate}
              onMatchCreate={onMatchCreate}
            />
          </div>
        </div>

        <div className="w-72 flex-shrink-0">
          <Card className="bg-gray-800/80 border-gray-700 p-4 sticky top-4">
            <h3 className="text-lg font-bold text-white mb-4">晋级名单管理</h3>
            <p className="text-xs text-gray-400 mb-4">点击分类标签添加队伍，点击队伍移除</p>
            <AdvancementEditor 
              teams={teams} 
              advancement={advancement} 
              onUpdate={onAdvancementUpdate} 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SwissStageVisualEditor;
