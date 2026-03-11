import React from 'react';
import { Team } from '@/types';

interface SwissTeamLogoProps {
  team?: Team;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const SwissTeamLogo: React.FC<SwissTeamLogoProps> = ({ team, size = 'md' }) => {
  if (!team?.logo) {
    return <div className={`${sizeClasses[size]} rounded-full bg-gray-700`} />;
  }

  return (
    <img
      src={team.logo}
      alt={team.name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  );
};

export default SwissTeamLogo;
