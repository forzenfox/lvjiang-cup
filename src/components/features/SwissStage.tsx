import React from 'react';
import { Match, Team } from '@/types';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, XCircle, ArrowRight } from 'lucide-react';

interface SwissStageProps {
  matches: Match[];
  teams: Team[];
  advancement: {
    winners2_0: string[];
    winners2_1: string[];
    losersBracket: string[];
    eliminated3rd: string[];
    eliminated0_3: string[];
  };
}

// Helper: Get team logo or placeholder
const TeamLogo: React.FC<{ team?: Team }> = ({ team }) => {
  if (!team?.logo) return <div className="w-5 h-5 rounded-full bg-gray-700" />;
  return <img src={team.logo} alt={team.name} className="w-5 h-5 rounded-full object-cover" />;
};

const MatchCard: React.FC<{ match: Match; teams: Team[]; isBo3?: boolean }> = ({ match, teams, isBo3 }) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';

  return (
    <Card className="bg-gray-800/80 border-gray-700 p-2.5 hover:bg-gray-800 transition-colors group relative overflow-hidden">
      {isBo3 && (
        <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-bl font-mono">
          BO3
        </div>
      )}
      <div className="flex flex-col gap-2">
        {/* Team A */}
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

        {/* Team B */}
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
  );
};

const RoundColumn: React.FC<{
  title: string;
  matches: Match[];
  teams: Team[];
  className?: string;
  isBo3?: boolean;
}> = ({ title, matches, teams, className, isBo3 }) => {
  // Always render the container to preserve layout, even if matches is empty
  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${className}`}>
      <div className="text-center pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex flex-col gap-3 min-h-[60px]">
        {matches.length > 0 ? (
          matches.map(match => (
            <MatchCard key={match.id} match={match} teams={teams} isBo3={isBo3} />
          ))
        ) : (
          <div className="flex items-center justify-center h-20 border border-dashed border-gray-800 rounded bg-gray-900/30 text-xs text-gray-600">
            等待对阵
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ type: 'qualified' | 'eliminated' | 'danger'; children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    qualified: 'bg-green-500/10 text-green-400 border-green-500/20',
    eliminated: 'bg-red-500/10 text-red-400 border-red-500/20',
    danger: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  };

  return (
    <div className={`px-3 py-1.5 rounded border text-xs font-medium text-center ${styles[type]}`}>
      {children}
    </div>
  );
};

const TeamList: React.FC<{ teams: Team[]; ids: string[] }> = ({ teams, ids }) => {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {ids.map(id => {
        const team = teams.find(t => t.id === id);
        if (!team) return null;
        return (
          <div key={id} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 p-1.5 rounded">
            <TeamLogo team={team} />
            <span>{team.name}</span>
          </div>
        );
      })}
    </div>
  );
};

const SwissStage: React.FC<SwissStageProps> = ({ matches, teams, advancement }) => {
  // Group matches by Record
  const round1Matches = matches.filter(m => m.swissRecord === '0-0');
  const round2High = matches.filter(m => m.swissRecord === '1-0');
  const round2Low = matches.filter(m => m.swissRecord === '0-1');
  const round3Mid = matches.filter(m => m.swissRecord === '1-1');
  const round3Low = matches.filter(m => m.swissRecord === '0-2');
  const round4Last = matches.filter(m => m.swissRecord === '1-2');

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-8 min-w-[1000px] p-4">
        {/* Round 1 (0-0) */}
        <div className="flex flex-col gap-4 w-64">
          <RoundColumn title="Round 1 (0-0)" matches={round1Matches} teams={teams} />
        </div>

        {/* Round 2 (1-0 & 0-1) */}
        <div className="flex flex-col gap-8 w-64 mt-8">
          <RoundColumn title="Round 2 High (1-0)" matches={round2High} teams={teams} isBo3 />
          <RoundColumn title="Round 2 Low (0-1)" matches={round2Low} teams={teams} isBo3 />
        </div>

        {/* Round 3 (1-1 & 0-2) + 2-0 Advancement */}
        <div className="flex flex-col gap-8 w-64">
          {/* 2-0 Qualified */}
          <div className="flex flex-col gap-2">
            <StatusBadge type="qualified">2-0 晋级 (胜者组)</StatusBadge>
            <TeamList teams={teams} ids={advancement.winners2_0} />
          </div>

          <RoundColumn title="Round 3 Mid (1-1)" matches={round3Mid} teams={teams} isBo3 />

          <div className="mt-4">
            <RoundColumn title="Round 3 Low (0-2)" matches={round3Low} teams={teams} isBo3 />
            <div className="mt-2">
              <StatusBadge type="eliminated">0-3 淘汰</StatusBadge>
              <TeamList teams={teams} ids={advancement.eliminated0_3} />
            </div>
          </div>
        </div>

        {/* Round 4 (1-2) + Advancement */}
        <div className="flex flex-col gap-8 w-64 mt-16">
          <div className="flex flex-col gap-2">
            <StatusBadge type="qualified">2-1 晋级 (胜者组)</StatusBadge>
            <TeamList teams={teams} ids={advancement.winners2_1} />
          </div>

          <RoundColumn title="Last Chance (1-2)" matches={round4Last} teams={teams} isBo3 />

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <StatusBadge type="danger">晋级败者组</StatusBadge>
              <TeamList teams={teams} ids={advancement.losersBracket} />
            </div>
            <div className="flex flex-col gap-2">
              <StatusBadge type="eliminated">积分第三淘汰</StatusBadge>
              <TeamList teams={teams} ids={advancement.eliminated3rd} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissStage;
