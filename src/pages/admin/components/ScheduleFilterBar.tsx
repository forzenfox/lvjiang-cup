import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { MatchStage, MatchStatus } from '../../../types';

interface FilterState {
  stage: MatchStage | 'all';
  status: MatchStatus | 'all';
  search: string;
  sortOrder: 'asc' | 'desc';
}

interface ScheduleFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}

const ScheduleFilterBar: React.FC<ScheduleFilterBarProps> = ({ filters, onFilterChange }) => {
  const handleChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex flex-1 gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索队伍..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stage Filter */}
        <div className="relative min-w-[120px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filters.stage}
            onChange={(e) => handleChange('stage', e.target.value as FilterState['stage'])}
            className="w-full pl-9 pr-8 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">所有赛段</option>
            <option value="swiss">瑞士轮</option>
            <option value="elimination">淘汰赛</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[120px]">
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value as FilterState['status'])}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">所有状态</option>
            <option value="upcoming">未开始</option>
            <option value="ongoing">进行中</option>
            <option value="finished">已结束</option>
          </select>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <span className="text-sm text-gray-400 whitespace-nowrap">时间排序:</span>
        <button
          onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white hover:bg-gray-700 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {filters.sortOrder === 'asc' ? '最早在前' : '最新在前'}
        </button>
      </div>
    </div>
  );
};

export default ScheduleFilterBar;
