import React, { useEffect, useState } from 'react';
import { mockService } from '../../mock/service';
import { Team } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { User } from 'lucide-react';
import { TopIcon, JungleIcon, MidIcon, AdcIcon, SupportIcon } from '../icons/PositionIcons';

const PositionIcon: React.FC<{ position: string }> = ({ position }) => {
  switch (position.toLowerCase()) {
    case '上单': return <TopIcon className="w-4 h-4" />;
    case '打野': return <JungleIcon className="w-4 h-4" />;
    case '中单': return <MidIcon className="w-4 h-4" />;
    case 'adc': return <AdcIcon className="w-4 h-4" />;
    case '辅助': return <SupportIcon className="w-4 h-4" />;
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
          参赛战队
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
