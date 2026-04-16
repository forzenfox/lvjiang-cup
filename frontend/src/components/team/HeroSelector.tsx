import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getChampionNameToEn } from '../../utils/championUtils';
import { ZIndexLayers } from '../../constants/zIndex';

export interface HeroSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedHeroes: string[];
  onConfirm: (heroes: string[]) => void;
  maxSelect?: number;
}

const HeroSelector: React.FC<HeroSelectorProps> = ({
  visible,
  onClose,
  selectedHeroes,
  onConfirm,
  maxSelect = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setLocalSelected(selectedHeroes);
      setSearchQuery('');
    }
  }, [visible, selectedHeroes]);

  const allHeroes = useMemo(() => {
    const cnToEnMap = getChampionNameToEn();
    return Object.keys(cnToEnMap).sort();
  }, []);

  const filteredHeroes = useMemo(() => {
    if (!searchQuery.trim()) {
      return allHeroes;
    }
    const query = searchQuery.toLowerCase();
    return allHeroes.filter(cnName => cnName.toLowerCase().includes(query));
  }, [allHeroes, searchQuery]);

  const toggleHero = (heroName: string) => {
    if (localSelected.includes(heroName)) {
      setLocalSelected(prev => prev.filter(h => h !== heroName));
    } else if (localSelected.length < maxSelect) {
      setLocalSelected(prev => [...prev, heroName]);
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (visible) {
          handleConfirm();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, localSelected]);

  if (!visible) return null;

  return (
    <>
      {/* 滚动条样式 - 使用与主题协调的深蓝色 */}
      <style>{`
        .hero-selector-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .hero-selector-scroll::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
        }
        .hero-selector-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .hero-selector-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
      <div
        ref={containerRef}
        className={cn(
          'absolute w-full mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-xl',
          'animate-in fade-in zoom-in-95 duration-150'
        )}
        style={{ maxHeight: '320px', zIndex: ZIndexLayers.DROPDOWN }}
      >
        <div className="sticky top-0 px-3 py-3 border-b border-white/10 bg-[#0F172A]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索英雄..."
              className={cn(
                'w-full h-9 pl-9 pr-8 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border border-white/10 rounded-lg',
                'outline-none transition-colors duration-150',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="p-2 overflow-y-auto hero-selector-scroll" style={{ maxHeight: '240px' }}>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
          >
            {filteredHeroes.map(heroName => {
              const isSelected = localSelected.includes(heroName);
              return (
                <button
                  key={heroName}
                  onClick={() => toggleHero(heroName)}
                  className={cn(
                    'relative h-9 px-2 rounded-md text-sm text-left',
                    'transition-all duration-150',
                    'flex items-center justify-between',
                    isSelected
                      ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                      : 'bg-white/05 border border-transparent text-[#94A3B8] hover:bg-white/10 hover:border-white/10'
                  )}
                >
                  <span className="truncate">{heroName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="py-6 text-center text-[#64748B] text-sm">未找到匹配的英雄</div>
          )}
        </div>

        <div className="sticky bottom-0 px-3 py-2 border-t border-white/10 bg-[#0F172A] flex items-center justify-between">
          <span className="text-xs text-gray-500">
            已选择 {localSelected.length}/{maxSelect} 个英雄
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLocalSelected(selectedHeroes);
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSelector;
