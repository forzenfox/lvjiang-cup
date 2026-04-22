import { useState, useEffect, useRef } from 'react';

export interface ImageSource {
  cdn: string;
  local: string;
}

/**
 * 检查图片是否可访问
 * 使用 Image 对象加载，比 fetch 更可靠（不受 CORS 限制）
 */
function checkImage(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    // 设置超时，避免长时间等待
    setTimeout(() => resolve(false), 5000);
    img.src = url;
  });
}

export function useImageWithFallback<T extends ImageSource>(sources: readonly T[]): readonly T[] {
  const [availableSources, setAvailableSources] = useState<T[]>(sources as T[]);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkImages = async () => {
      const newAvailable: T[] = [];

      for (const source of sources) {
        // 先检查 CDN 是否可用
        const cdnAvailable = await checkImage(source.cdn);

        if (cdnAvailable) {
          // CDN 可用，使用 CDN 地址
          newAvailable.push(source);
        } else {
          // CDN 不可用，检查本地是否可用
          const localAvailable = await checkImage(source.local);

          if (localAvailable) {
            // 本地可用，用本地路径替换 CDN 路径
            newAvailable.push({ ...source, cdn: source.local });
          } else {
            // 两者都不可用，仍然保留原配置（让组件自己处理错误）
            newAvailable.push(source);
          }
        }
      }

      setAvailableSources(newAvailable);
    };

    checkImages();
  }, [sources]);

  return availableSources;
}
