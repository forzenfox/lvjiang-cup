import React from 'react';
import { Match, Team } from '@/types';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, XCircle } from 'lucide-react';

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

const MatchCard: React.FC<{ match: Match; teams: Team[] }> = ({ match, teams }) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);
  const isFinished = match.status === 'finished';

  return (
    <Card className="bg-gray-800/80 border-gray-700 p-3 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Team A */}
        <div className={`flex-1 text-right ${match.winnerId === match.teamAId ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}>
          <span className="text-sm">{teamA?.name || '待定'}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 rounded">
          <span className={`text-sm font-bold w-4 text-center ${isFinished && match.winnerId === match.teamAId ? 'text-yellow-400' : 'text-gray-400'}`}>
            {match.scoreA}
          </span>
          <span className="text-gray-500">:</span>
          <span className={`text-sm font-bold w-4 text-center ${isFinished && match.winnerId === match.teamBId ? 'text-yellow-400' : 'text-gray-400'}`}>
            {match.scoreB}
          </span>
        </div>

        {/* Team B */}
        <div className={`flex-1 text-left ${match.winnerId === match.teamBId ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}>
          <span className="text-sm">{teamB?.name || '待定'}</span>
        </div>
      </div>
      <div className="text-center mt-1">
        <span className="text-xs text-gray-500">{match.round}</span>
      </div>
    </Card>
  );
};

const DaySection: React.FC<{ day: number; matches: Match[]; teams: Team[]; record: string }> = ({ 
  day, matches, teams, record 
}) => {
  if (matches.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-white">Day {day}</h3>
        <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs rounded">{record}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} teams={teams} />
        ))}
      </div>
    </div>
  );
};

const AdvancementSection: React.FC<{ 
  title: string; 
  teamIds: string[]; 
  teams: Team[]; 
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, teamIds, teams, icon, colorClass }) => {
  if (teamIds.length === 0) return null;

  return (
    <div className={`p-4 rounded-lg border ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {teamIds.map(teamId => {
          const team = teams.find(t => t.id === teamId);
          return team ? (
            <span key={teamId} className="px-3 py-1 bg-gray-800 rounded text-sm">
              {team.name}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
};

const SwissStage: React.FC<SwissStageProps> = ({ matches, teams, advancement }) => {
  // Group matches by day
  const day1Matches = matches.filter(m => m.swissDay === 1);
  const day2Matches = matches.filter(m => m.swissDay === 2);
  const day3Matches = matches.filter(m => m.swissDay === 3);
  const day4Matches = matches.filter(m => m.swissDay === 4);

  return (
    <div className="space-y-6">
      {/* Swiss Rounds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <DaySection day={1} matches={day1Matches} teams={teams} record="0-0 BO1" />
          <DaySection day={2} matches={day2Matches} teams={teams} record="1-0 / 0-1 BO3" />
        </div>
        <div>
          <DaySection day={3} matches={day3Matches} teams={teams} record="1-1 / 0-2 BO3" />
          <DaySection day={4} matches={day4Matches} teams={teams} record="1-2 积分循环" />
        </div>
      </div>

      {/* Advancement Results */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          晋级结果
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdvancementSection
            title="2-0 晋级胜者组"
            teamIds={advancement.winners2_0}
            teams={teams}
            icon={<Trophy className="w-4 h-4 text-yellow-400" />}
            colorClass="border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
          />
          <AdvancementSection
            title="2-1 晋级胜者组"
            teamIds={advancement.winners2_1}
            teams={teams}
            icon={<Medal className="w-4 h-4 text-blue-400" />}
            colorClass="border-blue-400/30 bg-blue-400/10 text-blue-400"
          />
          <AdvancementSection
            title="晋级败者组"
            teamIds={advancement.losersBracket}
            teams={teams}
            icon={<Medal className="w-4 h-4 text-gray-400" />}
            colorClass="border-gray-400/30 bg-gray-400/10 text-gray-400"
          />
          <AdvancementSection
            title="积分第三淘汰"
            teamIds={advancement.eliminated3rd}
            teams={teams}
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            colorClass="border-red-400/30 bg-red-400/10 text-red-400"
          />
          <AdvancementSection
            title="0-3 淘汰"
            teamIds={advancement.eliminated0_3}
            teams={teams}
            icon={<XCircle className="w-4 h-4 text-red-600" />}
            colorClass="border-red-600/30 bg-red-600/10 text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default SwissStage;
