import React from 'react';

interface BracketConnectorProps {
  type: 'horizontal' | 'vertical' | 'elbow-right' | 'elbow-left' | 't-junction';
  isWinnerPath?: boolean;
  className?: string;
}

const BracketConnector: React.FC<BracketConnectorProps> = ({
  type,
  isWinnerPath = false,
  className = ''
}) => {
  const colorClass = isWinnerPath ? 'bg-yellow-500' : 'bg-gray-600';

  switch (type) {
    case 'horizontal':
      return (
        <div className={`h-0.5 w-8 ${colorClass} ${className}`} />
      );
    
    case 'vertical':
      return (
        <div className={`w-0.5 h-8 ${colorClass} ${className}`} />
      );
    
    case 'elbow-right':
      return (
        <div className={`relative w-8 h-8 ${className}`}>
          <div className={`absolute top-0 left-0 w-4 h-0.5 ${colorClass}`} />
          <div className={`absolute top-0 left-4 w-0.5 h-full ${colorClass}`} />
          <div className={`absolute bottom-0 left-4 w-4 h-0.5 ${colorClass}`} />
        </div>
      );
    
    case 'elbow-left':
      return (
        <div className={`relative w-8 h-8 ${className}`}>
          <div className={`absolute top-0 right-0 w-4 h-0.5 ${colorClass}`} />
          <div className={`absolute top-0 right-4 w-0.5 h-full ${colorClass}`} />
          <div className={`absolute bottom-0 right-4 w-4 h-0.5 ${colorClass}`} />
        </div>
      );
    
    case 't-junction':
      return (
        <div className={`relative w-8 h-16 ${className}`}>
          {/* Vertical line */}
          <div className={`absolute left-0 top-0 w-0.5 h-full ${colorClass}`} />
          {/* Top horizontal */}
          <div className={`absolute left-0 top-0 w-4 h-0.5 ${colorClass}`} />
          {/* Bottom horizontal */}
          <div className={`absolute left-0 bottom-0 w-4 h-0.5 ${colorClass}`} />
        </div>
      );
    
    default:
      return null;
  }
};

// SVG version for more complex connections
export const BracketConnectorSVG: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isWinnerPath?: boolean;
}> = ({ startX, startY, endX, endY, isWinnerPath = false }) => {
  // Calculate control points for bezier curve
  const midX = (startX + endX) / 2;
  
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  
  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <path
        d={path}
        stroke={isWinnerPath ? '#F59E0B' : '#4B5563'}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default BracketConnector;
