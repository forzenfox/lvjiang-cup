import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getChampionList, type Champion } from '../../api/champion';
import { ZIndexLayers } from '../../constants/zIndex';

export interface HeroSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedHeroes: string[];
  onConfirm: (heroes: string[]) => void;
  maxSelect?: number;
}

const TAG_MAP: Record<string, string> = {
  Fighter: '战士',
  Mage: '法师',
  Marksman: '射手',
  Support: '辅助',
  Tank: '坦克',
  Assassin: '刺客',
};

const ALL_TAGS = Object.keys(TAG_MAP);

const HeroSelector: React.FC<HeroSelectorProps> = ({
  visible,
  onClose,
  selectedHeroes,
  onConfirm,
  maxSelect = 5,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [championData, setChampionData] = useState<Champion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setLocalSelected(selectedHeroes);
      setSearchQuery('');
      setSelectedTags([]);
    }
  }, [visible, selectedHeroes]);

  useEffect(() => {
    if (visible) {
      const loadChampions = async () => {
        try {
          const { champions } = await getChampionList();
          const championList = Object.values(champions).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setChampionData(championList);
        } catch (error) {
          console.error('加载英雄数据失败:', error);
          setChampionData([]);
        }
      };
      loadChampions();
    }
  }, [visible]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const filteredHeroes = useMemo(() => {
    return championData.filter(hero => {
      if (selectedTags.length > 0) {
        const hasMatchingTag = hero.tags.some(tag => selectedTags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = hero.name.toLowerCase().includes(query);
        const matchTitle = hero.title.toLowerCase().includes(query);
        if (!matchName && !matchTitle) return false;
      }

      return true;
    });
  }, [championData, selectedTags, searchQuery]);

  const toggleHero = (heroId: string) => {
    if (localSelected.includes(heroId)) {
      setLocalSelected(prev => prev.filter(h => h !== heroId));
    } else if (localSelected.length < maxSelect) {
      setLocalSelected(prev => [...prev, heroId]);
    }
  };

  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.hero-pool-container')) {
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
        style={{ maxHeight: '480px', zIndex: ZIndexLayers.DROPDOWN }}
      >
        <div className="sticky top-0 px-3 py-3 border-b border-white/10 bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1" style={{ maxWidth: '280px' }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索英雄名称或称号..."
                className={cn(
                  'w-full h-8 pl-9 pr-8 text-sm text-white placeholder-[#475569]',
                  'bg-white/5 border border-white/10 rounded-lg',
                  'outline-none transition-colors duration-150',
                  'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                )}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-[#64748B] whitespace-nowrap">
              已选择 {localSelected.length}/{maxSelect}
              {filteredHeroes.length > 0 && (
                <span className="ml-1 text-[#475569]">/ {filteredHeroes.length}</span>
              )}
            </span>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setLocalSelected(selectedHeroes);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors rounded"
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

          <div className="flex flex-wrap gap-2 mt-3">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-all duration-150',
                  selectedTags.includes(tag)
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                    : 'bg-white/5 border border-white/10 text-[#94A3B8] hover:bg-white/10 hover:border-white/20'
                )}
              >
                {TAG_MAP[tag]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-2 overflow-y-auto hero-selector-scroll" style={{ maxHeight: '320px' }}>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {filteredHeroes.map(hero => {
              const isSelected = localSelected.includes(hero.id);
              return (
                <button
                  key={hero.id}
                  onClick={() => toggleHero(hero.id)}
                  className={cn(
                    'relative h-10 px-2 rounded-md text-sm text-left',
                    'transition-all duration-150',
                    'flex items-center justify-center',
                    isSelected
                      ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                      : 'bg-white/05 border border-transparent text-[#94A3B8] hover:bg-white/10 hover:border-white/10'
                  )}
                >
                  <span className="truncate font-medium">{hero.name}</span>
                  <span className="mx-1 text-[#475569]">·</span>
                  <span className="truncate text-xs text-amber-400/80">{hero.title}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="py-6 text-center text-[#64748B] text-sm">未找到匹配的英雄</div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeroSelector;
