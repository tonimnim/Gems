'use client';

import { useState, useEffect, useCallback } from 'react';

export function useSavedGems() {
  const [savedGems, setSavedGems] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hiddenGems_saved');
    if (saved) {
      try {
        setSavedGems(JSON.parse(saved));
      } catch {
        setSavedGems([]);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleSave = useCallback((gemId: string) => {
    setSavedGems((prev) => {
      const newSaved = prev.includes(gemId)
        ? prev.filter((id) => id !== gemId)
        : [...prev, gemId];
      localStorage.setItem('hiddenGems_saved', JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  const isSaved = useCallback((gemId: string) => savedGems.includes(gemId), [savedGems]);

  const saveGem = useCallback((gemId: string) => {
    setSavedGems((prev) => {
      if (prev.includes(gemId)) return prev;
      const newSaved = [...prev, gemId];
      localStorage.setItem('hiddenGems_saved', JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  const unsaveGem = useCallback((gemId: string) => {
    setSavedGems((prev) => {
      const newSaved = prev.filter((id) => id !== gemId);
      localStorage.setItem('hiddenGems_saved', JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  return {
    savedGems,
    toggleSave,
    isSaved,
    saveGem,
    unsaveGem,
    isLoaded,
    count: savedGems.length
  };
}
