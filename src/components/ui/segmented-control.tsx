import React from 'react';

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange, options }) => {
  return (
    <div className="inline-flex bg-gray-800 rounded-lg p-1 border border-gray-700">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${value === option.value 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;
