'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { SearchOverlay } from '@/components/search/SearchOverlay';

type SearchContextValue = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openSearch: (initialQuery?: string) => void;
  initialQuery: string;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isOpen, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const openSearch = useCallback((query = '') => {
    setInitialQuery(query);
    setOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      setOpen,
      openSearch,
      initialQuery,
    }),
    [isOpen, openSearch, initialQuery],
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchOverlay />
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
