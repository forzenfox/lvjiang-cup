import { useState, useEffect, useCallback, type RefCallback } from 'react';

interface UseIntersectionObserverReturn {
  ref: RefCallback<HTMLElement>;
  isVisible: boolean;
}

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): UseIntersectionObserverReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, options]);

  return { ref, isVisible };
}
