import React from 'react';

interface ICPInfoProps {
  number: string;
}

export const ICPInfo: React.FC<ICPInfoProps> = ({ number }) => {
  return (
    <div className="text-gray-300 text-sm" data-testid="icp-info">
      {number}
    </div>
  );
};
