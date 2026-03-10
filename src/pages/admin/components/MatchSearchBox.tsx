import React from 'react';
import { Search } from 'lucide-react';

export interface MatchSearchBoxProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  placeholder: string;
}

export const MatchSearchBox: React.FC<MatchSearchBoxProps> = ({
  searchTerm,
  onSearchTermChange,
  placeholder,
}) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};
