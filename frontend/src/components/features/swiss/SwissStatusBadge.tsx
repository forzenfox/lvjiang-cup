import React from 'react';

interface SwissStatusBadgeProps {
  type: 'qualified' | 'eliminated' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
}

const styles = {
  qualified: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
  eliminated: 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20',
  danger: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20',
};

const SwissStatusBadge: React.FC<SwissStatusBadgeProps> = ({ type, children, onClick }) => {
  return (
    <div
      className={`px-3 py-1.5 rounded border text-xs font-medium text-center ${styles[type]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default SwissStatusBadge;
