import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  // 初始化时就检查实际匹配状态，避免首次渲染使用错误值
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);

    // 检查当前状态（处理页面加载时已匹配但初始状态不一致的情况）
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const useIsMobile = () => useMediaQuery('(max-width: 1023px)');
