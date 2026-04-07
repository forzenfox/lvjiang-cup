import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getChampionNameToEn } from '../../utils/championUtils';

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
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // 同步外部 selectedHeroes 到本地状态
  useEffect(() => {
    if (visible) {
      setLocalSelected(selectedHeroes);
      setSearchQuery('');
    }
  }, [visible, selectedHeroes]);

  // 获取所有英雄列表
  const allHeroes = useMemo(() => {
    const cnToEnMap = getChampionNameToEn();
    return Object.keys(cnToEnMap).sort();
  }, []);

  // 搜索过滤（模糊匹配中文名称）
  const filteredHeroes = useMemo(() => {
    if (!searchQuery.trim()) {
      return allHeroes;
    }
    const query = searchQuery.toLowerCase();
    return allHeroes.filter(cnName =>
      cnName.toLowerCase().includes(query)
    );
  }, [allHeroes, searchQuery]);

  // 切换英雄选中状态
  const toggleHero = (heroName: string) => {
    if (localSelected.includes(heroName)) {
      // 取消选中
      setLocalSelected(prev => prev.filter(h => h !== heroName));
    } else if (localSelected.length < maxSelect) {
      // 选中新英雄
      setLocalSelected(prev => [...prev, heroName]);
    } else {
      // 超过最大选择数，显示警告
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 2000);
    }
  };

  // 确认选择
  const handleConfirm = () => {
    onConfirm(localSelected);
    onClose();
  };

  // 取消选择
  const handleCancel = () => {
    setLocalSelected(selectedHeroes);
    onClose();
  };

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩背景 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* 弹框内容 */}
      <div
        className={cn(
          'relative z-50 w-full max-w-[400px] mx-4 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl',
          'animate-in zoom-in-95 fade-in duration-200'
        )}
        style={{ maxHeight: '500px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-selector-title"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 id="hero-selector-title" className="text-lg font-semibold text-white">
            选择常用英雄 ({localSelected.length}/{maxSelect})
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索英雄名称..."
              className={cn(
                'w-full h-10 pl-10 pr-4 text-sm text-white placeholder-[#475569]',
                'bg-white/5 border border-white/10 rounded-lg',
                'outline-none transition-colors duration-150',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              )}
            />
          </div>
        </div>

        {/* 英雄列表 */}
        <div
          className="px-4 pb-4 overflow-y-auto"
          style={{ maxHeight: 'calc(500px - 180px)' }}
        >
          <div className="grid grid-cols-2 gap-3">
            {filteredHeroes.map((heroName) => {
              const isSelected = localSelected.includes(heroName);
              return (
                <button
                  key={heroName}
                  onClick={() => toggleHero(heroName)}
                  className={cn(
                    'relative h-12 px-3 rounded-lg text-sm text-left',
                    'transition-all duration-150',
                    'flex items-center justify-between',
                    isSelected
                      ? 'bg-blue-500/10 border border-blue-500 text-white'
                      : 'bg-white/03 border border-white/08 text-[#94A3B8] hover:bg-white/06 hover:border-white/12'
                  )}
                >
                  <span className="truncate">{heroName}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="py-8 text-center text-[#64748B] text-sm">
              未找到匹配的英雄
            </div>
          )}
        </div>

        {/* 超过限制警告 */}
        {showLimitWarning && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            最多选择 {maxSelect} 个英雄
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSelector;