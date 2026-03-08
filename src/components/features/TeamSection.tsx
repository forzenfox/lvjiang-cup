import React, { useEffect, useState } from 'react';
import { mockService } from '../../mock/service';
import { Team, Player } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn } from '../../lib/utils';
import { User, Shield, Sword, Target, Crosshair, Zap } from 'lucide-react';

const PositionIcon: React.FC<{ position: string }> = ({ position }) => {
  switch (position.toLowerCase()) {
    case 'top': return <Shield className="w-4 h-4 text-blue-400" />;
    case 'jungle': return <Sword className="w-4 h-4 text-green-400" />;
    case 'mid': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'adc': return <Target className="w-4 h-4 text-red-400" />;
    case 'support': return <Crosshair className="w-4 h-4 text-purple-400" />;
    default: return <User className="w-4 h-4 text-gray-400" />;
  }
};

const TeamSection: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    mockService.getTeams().then(setTeams);
  }, []);

  return (
    <section id="teams" className="min-h-screen py-20 bg-gradient-to-b from-background to-black relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white uppercase tracking-wider">
          Participating Teams
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teams.map((team) => (
            <Card key={team.id} className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all duration-300 hover:transform hover:-translate-y-2 group overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-blue-900/50 to-purple-900/50 relative flex items-center justify-center p-4">
                <img 
                  src={team.logo} 
                  alt={team.name} 
                  className="w-24 h-24 object-contain drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300" 
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-center text-secondary group-hover:text-white transition-colors">{team.name}</CardTitle>
                <CardDescription className="text-center">{team.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {team.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded bg-black/20 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                        <span className="text-sm font-medium text-gray-200">{player.name}</span>
                      </div>
                      <div className="flex items-center space-x-1" title={player.position}>
                        <PositionIcon position={player.position} />
                        <span className="text-xs text-gray-400 hidden sm:inline">{player.position}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
