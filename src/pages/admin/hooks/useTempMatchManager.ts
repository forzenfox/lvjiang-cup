import { useState } from 'react';

export interface TempMatch<T = unknown> {
  id: string;
  match: T;
}

export interface UseTempMatchManagerOptions<T> {
  initialGroups: Record<string, TempMatch<T>[]>;
}

export function useTempMatchManager<T = unknown>(
  options: UseTempMatchManagerOptions<T>
) {
  const [tempMatches, setTempMatches] = useState<Record<string, TempMatch<T>[]>>(
    options.initialGroups
  );

  const addTempMatch = (poolKey: string, match: T) => {
    const newTempMatch: TempMatch<T> = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      match,
    };
    setTempMatches(prev => ({
      ...prev,
      [poolKey]: [...(prev[poolKey] || []), newTempMatch],
    }));
  };

  const cancelTempMatch = (poolKey: string, tempId: string) => {
    setTempMatches(prev => ({
      ...prev,
      [poolKey]: (prev[poolKey] || []).filter(t => t.id !== tempId),
    }));
  };

  const saveTempMatch = (
    poolKey: string,
    tempId: string,
    onSave: (match: T) => void
  ) => {
    const tempMatch = (tempMatches[poolKey] || []).find(t => t.id === tempId);
    if (tempMatch) {
      onSave(tempMatch.match);
      setTempMatches(prev => ({
        ...prev,
        [poolKey]: prev[poolKey].filter(t => t.id !== tempId),
      }));
    }
  };

  const getPoolTempMatches = (poolKey: string): TempMatch<T>[] => {
    return tempMatches[poolKey] || [];
  };

  return {
    tempMatches,
    addTempMatch,
    cancelTempMatch,
    saveTempMatch,
    getPoolTempMatches,
  };
}
