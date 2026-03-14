import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock, GripVertical, Save, RotateCcw, Check } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
import { swissRoundSlots, SwissRoundSlot, getRoundFormat } from './swissRoundSlots';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';
import { categoryConfig, categoryOrder } from '@/store/advancementStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SwissStageVisualEditorProps {
  matches: Match[];
  teams: Team[];
  advancement: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  };
  onMatchUpdate: (match: Match) => void;
  onAdvancementUpdate: (advancement: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  }) => void;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isEmpty = !match;

  // 获取显示用的队伍信息
  const displayMatch = match || {
    id: `new-${slot.swissRecord}-${slotIndex}`,
    teamAId: '',
    teamBId: '',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    round: slot.roundName,
    status: 'upcoming' as const,
    startTime: '',
    stage: 'swiss' as const,
    swissRecord: slot.swissRecord,
  };

  const teamA = teams.find(t => t.id === displayMatch.teamAId);
  const teamB = teams.find(t => t.id === displayMatch.teamBId);
  const isFinished = displayMatch.status === 'finished';

  const handleClick = () => {
    if (isEmpty && !onCreate) {
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSave = (updatedMatch: Match) => {
    if (match) {
      onUpdate(updatedMatch);
    } else if (onCreate) {
      onCreate(updatedMatch);
    }
    // 返回 true 让 MatchEditDialog 关闭对话框
    return true;
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  if (isEmpty) {
    return (
      <>
        <div 
          className="bg-gray-800/40 border-2 border-dashed border-gray-700 rounded-lg p-2.5 cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/60 transition-colors min-h-[80px] flex items-center justify-center"
          onClick={handleClick}
        >
          <div className="text-center text-gray-500 text-sm">
            <span className="block text-lg mb-1">+</span>
            等待对阵
          </div>
        </div>
        {onCreate && (
          <MatchEditDialog
            match={displayMatch}
            teams={teams}
            isOpen={isDialogOpen}
            onClose={handleClose}
            onSave={handleSave}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card
        className="bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden cursor-pointer hover:border-blue-500/50"
        onClick={handleClick}
      >
        <MatchStatusBadge status={match.status} />
        {match.startTime && (
          <div className="absolute top-0 left-0 bg-gray-700/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-br flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(match.startTime)}</span>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-4">
          <div className={`flex items-center justify-between ${match.winnerId === match.teamAId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              <TeamLogo team={teamA} />
              <span className={`text-sm font-medium ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-300'}`}>
                {teamA?.name || '待定'}
              </span>
            </div>
            <span className={`text-sm font-bold ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-500'}`}>
              {match.scoreA}
            </span>
          </div>

          <div className={`flex items-center justify-between ${match.winnerId === match.teamBId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              <TeamLogo team={teamB} />
              <span className={`text-sm font-medium ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-300'}`}>
                {teamB?.name || '待定'}
              </span>
            </div>
            <span className={`text-sm font-bold ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-500'}`}>
              {match.scoreB}
            </span>
          </div>
        </div>
      </Card>
      <MatchEditDialog
        match={match}
        teams={teams}
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSave={handleSave}
      />
    </>
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

interface DraggableTeamItemProps {
  team: Team;
  category: string;
  onDragStart: (e: React.DragEvent, teamId: string, fromCategory: string) => void;
  onRemove: (teamId: string, category: string) => void;
}

const DraggableTeamItem: React.FC<DraggableTeamItemProps> = ({ team, category, onDragStart, onRemove }) => {
  return (
    <div
      data-testid={`draggable-team-${team.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, team.id, category)}
      className="flex items-center justify-between text-sm text-gray-300 bg-gray-800/50 p-2 rounded border border-gray-700 cursor-move hover:bg-gray-800 hover:border-gray-600 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-gray-600" />
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-700" />
        )}
        <span data-testid={`draggable-team-name-${team.id}`} className="font-medium">{team.name}</span>
      </div>
      <button
        data-testid={`remove-team-${team.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(team.id, category);
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity px-1"
        title="移除"
      >
        ×
      </button>
    </div>
  );
};

interface AdvancementCategoryCardProps {
  category: string;
  teamIds: string[];
  teams: Team[];
  config: { label: string; color: string; description: string };
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, category: string) => void;
  onDragStart: (e: React.DragEvent, teamId: string, fromCategory: string) => void;
  onRemove: (teamId: string, category: string) => void;
}

const AdvancementCategoryCard: React.FC<AdvancementCategoryCardProps> = ({
  category,
  teamIds,
  teams,
  config,
  onDragOver,
  onDrop,
  onDragStart,
  onRemove,
}) => {
  const categoryTeams = teamIds
    .map(id => teams.find(t => t.id === id))
    .filter((t): t is Team => t !== undefined);

  return (
    <div
      data-testid={`advancement-category-${category}`}
      className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, category)}
    >
      <div data-testid={`advancement-category-header-${category}`} className={`px-3 py-2 border-b border-gray-700 ${config.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          <h4 data-testid={`advancement-category-label-${category}`} className="text-sm font-semibold text-white">{config.label}</h4>
          <span data-testid={`advancement-category-count-${category}`} className="text-xs text-gray-500 ml-auto">{categoryTeams.length}</span>
        </div>
        <p data-testid={`advancement-category-desc-${category}`} className="text-xs text-gray-500 mt-0.5">{config.description}</p>
      </div>
      <div data-testid={`advancement-category-teams-${category}`} className="p-2 space-y-1 min-h-[60px]">
        {categoryTeams.length === 0 ? (
          <div data-testid={`advancement-category-empty-${category}`} className="text-center py-4 text-gray-600 text-xs">
            拖拽队伍到此处
          </div>
        ) : (
          categoryTeams.map(team => (
            <DraggableTeamItem
              key={team.id}
              team={team}
              category={category}
              onDragStart={onDragStart}
              onRemove={onRemove}
            />
          ))
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
  const [localAdvancement, setLocalAdvancement] = useState(advancement);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedTeam, setDraggedTeam] = useState<{ teamId: string; fromCategory: string } | null>(null);

  // 当外部 advancement 变化时更新本地状态
  useEffect(() => {
    setLocalAdvancement(advancement);
  }, [advancement]);

  // 检测是否有未保存的更改
  useEffect(() => {
    const changed = 
      JSON.stringify(localAdvancement) !== JSON.stringify(advancement);
    setHasChanges(changed);
  }, [localAdvancement, advancement]);

  const matchesByRecord = swissRoundSlots.reduce((acc, slot) => {
    acc[slot.swissRecord] = matches.filter(m => m.swissRecord === slot.swissRecord);
    return acc;
  }, {} as Record<string, Match[]>);

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, teamId: string, fromCategory: string) => {
    setDraggedTeam({ teamId, fromCategory });
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽图像
    const team = teams.find(t => t.id === teamId);
    if (team) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ teamId, fromCategory }));
    }
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 放置
  const handleDrop = (e: React.DragEvent, toCategory: string) => {
    e.preventDefault();
    if (!draggedTeam) return;

    const { teamId, fromCategory } = draggedTeam;
    
    // 如果拖放到同一分类，不做任何操作
    if (fromCategory === toCategory) {
      setDraggedTeam(null);
      return;
    }

    // 更新本地状态
    setLocalAdvancement(prev => {
      const newAdvancement = { ...prev };
      
      // 从原分类移除
      if (fromCategory && newAdvancement[fromCategory as keyof typeof newAdvancement]) {
        newAdvancement[fromCategory as keyof typeof newAdvancement] = 
          newAdvancement[fromCategory as keyof typeof newAdvancement].filter(id => id !== teamId);
      }
      
      // 添加到新分类（如果不存在）
      if (!newAdvancement[toCategory as keyof typeof newAdvancement].includes(teamId)) {
        newAdvancement[toCategory as keyof typeof newAdvancement] = [
          ...newAdvancement[toCategory as keyof typeof newAdvancement],
          teamId
        ];
      }
      
      return newAdvancement;
    });

    setDraggedTeam(null);
    toast.success('队伍已移动，记得保存更改');
  };

  // 移除队伍
  const handleRemoveTeam = (teamId: string, category: string) => {
    setLocalAdvancement(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].filter(id => id !== teamId)
    }));
    toast.info('队伍已移除，记得保存更改');
  };

  // 保存更改
  const handleSave = () => {
    onAdvancementUpdate(localAdvancement);
    setHasChanges(false);
    toast.success('晋级名单已保存');
  };

  // 重置更改
  const handleReset = () => {
    setLocalAdvancement(advancement);
    toast.info('已重置为上次保存的状态');
  };

  // 获取未分配的队伍
  const getUnassignedTeams = () => {
    const assignedIds = Object.values(localAdvancement).flat();
    return teams.filter(t => !assignedIds.includes(t.id));
  };

  const unassignedTeams = getUnassignedTeams();

  return (
    <div data-testid="swiss-stage-editor" className="w-full">
      {/* 操作栏 */}
      <div data-testid="advancement-toolbar" className="flex justify-between items-center mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
          <span data-testid="advancement-sync-status" className="text-sm text-gray-400">
            {hasChanges ? (
              <span className="text-yellow-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                有未保存的更改
              </span>
            ) : (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                已同步
              </span>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              data-testid="advancement-reset-button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
          )}
          <Button
            data-testid="advancement-save-button"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1" />
            保存更改
          </Button>
        </div>
      </div>

      <div className="flex gap-8 min-w-[1400px] p-4 overflow-x-auto">
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

        {/* 晋级名单管理面板 */}
        <div data-testid="advancement-panel" className="w-80 flex-shrink-0 space-y-4">
          <Card data-testid="advancement-card" className="bg-gray-800/80 border-gray-700 p-4 sticky top-4">
            <h3 data-testid="advancement-title" className="text-lg font-bold text-white mb-2">晋级名单管理</h3>
            <p data-testid="advancement-description" className="text-xs text-gray-400 mb-4">
              拖拽队伍调整晋级状态，或点击 × 移除
            </p>

            {/* 未分配队伍 */}
            {unassignedTeams.length > 0 && (
              <div data-testid="unassigned-teams" className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                <p data-testid="unassigned-count" className="text-xs text-yellow-400 mb-2">
                  未分配 ({unassignedTeams.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {unassignedTeams.map(team => (
                    <div
                      key={team.id}
                      data-testid={`unassigned-team-${team.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, team.id, '')}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 cursor-move hover:border-yellow-600/50"
                    >
                      {team.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 晋级分类 */}
            <div data-testid="advancement-categories" className="space-y-3">
              {categoryOrder.map(category => (
                <AdvancementCategoryCard
                  key={category}
                  category={category}
                  teamIds={localAdvancement[category]}
                  teams={teams}
                  config={categoryConfig[category]}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragStart={handleDragStart}
                  onRemove={handleRemoveTeam}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SwissStageVisualEditor;
