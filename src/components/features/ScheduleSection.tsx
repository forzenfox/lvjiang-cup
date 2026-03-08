import React, { useEffect, useState } from 'react';
import { mockService } from '../../mock/service';
import { Match } from '../../types';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const MatchCard: React.FC<{ match: Match; isFinal?: boolean }> = ({ match, isFinal }) => {
  const isFinished = match.status === 'finished';
  
  return (
    <Card className={cn(
      "w-full max-w-sm border-white/10 bg-black/40 backdrop-blur-sm transition-all hover:border-secondary/50",
      isFinal && "border-secondary/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
    )}>
      <CardContent className="p-4">
        <div className="text-xs text-gray-400 mb-2 flex justify-between">
          <span>{match.round}</span>
          <span>{format(new Date(match.startTime), 'MMM d, HH:mm')}</span>
        </div>
        
        {/* Team A */}
        <div className={cn(
          "flex justify-between items-center p-2 rounded mb-2",
          match.winnerId === match.teamAId && isFinished ? "bg-secondary/20 text-secondary font-bold" : "bg-white/5",
          match.winnerId !== match.teamAId && isFinished && "opacity-50"
        )}>
          <div className="flex items-center space-x-3">
            {match.teamA?.logo && (
              <img src={match.teamA.logo} alt={match.teamA.name} className="w-8 h-8 rounded bg-gray-800" />
            )}
            <span>{match.teamA?.name || '待定'}</span>
          </div>
          <span className="text-xl font-mono">{match.scoreA}</span>
        </div>

        {/* Team B */}
        <div className={cn(
          "flex justify-between items-center p-2 rounded",
          match.winnerId === match.teamBId && isFinished ? "bg-secondary/20 text-secondary font-bold" : "bg-white/5",
          match.winnerId !== match.teamBId && isFinished && "opacity-50"
        )}>
          <div className="flex items-center space-x-3">
            {match.teamB?.logo && (
              <img src={match.teamB.logo} alt={match.teamB.name} className="w-8 h-8 rounded bg-gray-800" />
            )}
            <span>{match.teamB?.name || '待定'}</span>
          </div>
          <span className="text-xl font-mono">{match.scoreB}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const ScheduleSection: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    mockService.getMatches().then(setMatches);
  }, []);

  // Simple grouping by round
  const quarterFinals = matches.filter(m => m.round.includes('四分之一决赛'));
  const semiFinals = matches.filter(m => m.round.includes('半决赛'));
  const finals = matches.filter(m => m.round.includes('总决赛'));

  return (
    <section id="schedule" className="min-h-screen py-20 bg-background relative flex flex-col items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white uppercase tracking-wider">
          赛程安排
        </h2>

        <div className="flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-16 relative">
          {/* Quarter Finals Column */}
          <div className="flex flex-col gap-8 relative z-10">
            {quarterFinals.map(match => (
              <div key={match.id} className="relative">
                <MatchCard match={match} />
                {/* Connector lines for desktop */}
                <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-px bg-white/20"></div>
              </div>
            ))}
          </div>

          {/* Semi Finals Column */}
          <div className="flex flex-col gap-16 relative z-10">
            {semiFinals.map(match => (
              <div key={match.id} className="relative">
                <MatchCard match={match} />
                {/* Connector lines for desktop */}
                <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-px bg-white/20"></div>
              </div>
            ))}
          </div>

          {/* Finals Column */}
          <div className="flex flex-col justify-center relative z-10">
            {finals.map(match => (
              <MatchCard key={match.id} match={match} isFinal />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
