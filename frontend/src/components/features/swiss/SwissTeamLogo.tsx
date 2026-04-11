import React from 'react';
import { Team } from '@/types';

interface SwissTeamLogoProps {
  team?: Team;
  size?: 'sm' | 'md' | 'lg' | number;
}

const SwissTeamLogo: React.FC<SwissTeamLogoProps> = ({ team, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : undefined;
  const sizeClass = typeof size === 'number' ? '' : sizeClasses[size];

  if (!team?.logo) {
    return <div className={`${sizeClass} rounded-full bg-gray-700`} style={sizeStyle} />;
  }

  return (
    <img
      src={team.logo}
      alt={team.name}
      className={`${sizeClass} rounded-full object-cover`}
      style={sizeStyle}
    />
  );
};

export default SwissTeamLogo;