import React, { useState, useEffect } from 'react';
import { Match, Team, MatchStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Clock, Save, RotateCcw, Check } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
import { swissRoundSlots, SwissRoundSlot, getRoundFormat } from './swissRoundSlots';
import MatchEditDialog from '@/pages/admin/components/MatchEditDialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SwissStageVisualEditorProps {
  matches: Match[];
  teams: Team[];
  advancement?: {
    top8: string[];
    eliminated: string[];
  };
  onMatchUpdate: (match: Match) => void;
  onAdvancementUpdate?: (advancement: {
    top8: string[];
    eliminated: string[];
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
    finished: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
  };

  return (
    <span
      className={`absolute top-0 right-0 px-1.5 py-0.5 text-[10px] rounded-bl border ${styles[status]}`}
    >
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

const FixedSlotMatchCard: React.FC<FixedSlotMatchCardProps> = ({
  match,
  teams,
  slot,
  slotIndex,
  onUpdate,
  onCreate,
}) => {
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
          <div
            className={`flex items-center justify-between ${match.winnerId === match.teamAId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-2">
              <TeamLogo team={teamA} />
              <span
                className={`text-sm font-medium ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                {teamA?.name || '待定'}
              </span>
            </div>
            <span
              className={`text-sm font-bold ${match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              {match.scoreA}
            </span>
          </div>

          <div
            className={`flex items-center justify-between ${match.winnerId === match.teamBId ? 'opacity-100' : isFinished ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="flex items-center gap-2">
              <TeamLogo team={teamB} />
              <span
                className={`text-sm font-medium ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                {teamB?.name || '待定'}
              </span>
            </div>
            <span
              className={`text-sm font-bold ${match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-500'}`}
            >
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

const RoundColumn: React.FC<RoundColumnProps> = ({
  slot,
  matches,
  teams,
  className,
  onMatchUpdate,
  onMatchCreate,
}) => {
  const slots = Array.from({ length: slot.maxMatches }, (_, i) => {
    const match = matches[i] || null;
    return { match, index: i };
  });

  const roundFormat = getRoundFormat(slot.swissRecord);

  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${className}`}>
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {slot.roundName}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-gray-500">({slot.swissRecord})</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              roundFormat === 'BO1'
                ? 'bg-green-600/20 text-green-400'
                : 'bg-blue-600/20 text-blue-400'
            }`}
          >
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

// 10个战绩分组的配置（用于编辑器布局）
const EDITOR_RECORD_GROUPS = [
  { record: '0-0', label: 'Round 1' },
  { record: '1-0', label: 'Round 2 High' },
  { record: '0-1', label: 'Round 2 Low' },
  { record: '1-1', label: 'Round 3 Mid' },
  { record: '0-2', label: 'Round 3 Low' },
  { record: '2-0', label: '2-0 Group' },
  { record: '3-0', label: '3-0 Group' },
  { record: '2-1', label: 'Round 4 High' },
  { record: '1-2', label: 'Last Chance' },
  { record: '0-3', label: '0-3 Group' },
];

const SwissStageVisualEditor: React.FC<SwissStageVisualEditorProps> = ({
  matches,
  teams,
  advancement,
  onMatchUpdate,
  onAdvancementUpdate,
  onMatchCreate,
}) => {
  const matchesByRecord = swissRoundSlots.reduce(
    (acc, slot) => {
      acc[slot.swissRecord] = matches.filter(m => m.swissRecord === slot.swissRecord);
      return acc;
    },
    {} as Record<string, Match[]>
  );

  return (
    <div data-testid="swiss-stage-editor" className="w-full">
      {/* 操作栏 */}
      <div
        data-testid="advancement-toolbar"
        className="flex justify-between items-center mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <div className="flex items-center gap-2">
          <span data-testid="advancement-sync-status" className="text-sm text-gray-400">
            <span className="text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              已同步
            </span>
          </span>
          <span
            data-testid="advancement-status"
            className="ml-4 text-sm text-blue-400 bg-blue-900/20 px-2 py-1 rounded"
          >
            晋级状态：自动计算
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="advancement-refresh-button"
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('晋级状态根据比赛结果自动计算');
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            刷新
          </Button>
        </div>
      </div>

      <div className="flex gap-8 min-w-[1400px] p-4 overflow-x-auto">
        {/* 第一轮：0-0 */}
        <div className="flex flex-col gap-4 w-64">
          <RoundColumn
            slot={swissRoundSlots[0]}
            matches={matchesByRecord['0-0'] || []}
            teams={teams}
            onMatchUpdate={onMatchUpdate}
            onMatchCreate={onMatchCreate}
          />
        </div>

        {/* 第二轮：1-0 & 0-1 */}
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

        {/* 第三轮：1-1, 0-2 */}
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

        {/* 第四轮：2-1, 1-2 */}
        <div className="flex flex-col gap-8 w-64 mt-16">
          <RoundColumn
            slot={swissRoundSlots[5]}
            matches={matchesByRecord['2-1'] || []}
            teams={teams}
            onMatchUpdate={onMatchUpdate}
            onMatchCreate={onMatchCreate}
          />
        </div>
      </div>
    </div>
  );
};

export default SwissStageVisualEditor;