import { useState, useEffect } from 'react';

const STORAGE_KEY = 'comic_reader_last_page';

export function useComicProgress(initialPage: number = 1) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [savedPage, setSavedPage] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 1) {
          setSavedPage(parsed);
        }
      }
    } catch {
      // Ignore storage errors (private browsing, etc.)
    }
  }, []);

  const setPage = (page: number) => {
    setCurrentPage(page);
    try {
      localStorage.setItem(STORAGE_KEY, page.toString());
    } catch {
      // Ignore
    }
  };

  const clearSaved = () => {
    setSavedPage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return {
    currentPage,
    setPage,
    savedPage,
    clearSaved,
  };
}
