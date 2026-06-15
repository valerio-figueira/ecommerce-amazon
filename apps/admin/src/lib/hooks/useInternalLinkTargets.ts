'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { searchInternalLinkTargetsClient } from '@/lib/api/internal-link-targets-client';
import type { InternalLinkTarget } from '@/lib/internal-link-targets';

const SEARCH_DEBOUNCE_MS = 300;

type UseInternalLinkTargetSearchOptions = {
  enabled: boolean;
  selectedUrl?: string;
  productLimit?: number;
};

type UseInternalLinkTargetSearchResult = {
  targets: InternalLinkTarget[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  requiresMinSearchLength: number;
  productLimit: number;
};

export function useInternalLinkTargetSearch({
  enabled,
  selectedUrl = '',
  productLimit = 20,
}: UseInternalLinkTargetSearchOptions): UseInternalLinkTargetSearchResult {
  const [targets, setTargets] = useState<InternalLinkTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [requiresMinSearchLength, setRequiresMinSearchLength] = useState(2);
  const [resolvedProductLimit, setResolvedProductLimit] = useState(productLimit);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (query: string, currentSelectedUrl: string) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const result = await searchInternalLinkTargetsClient({
          search: query,
          productLimit,
          ...(currentSelectedUrl.length > 0 ? { selectedUrl: currentSelectedUrl } : {}),
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        setTargets(result.targets);
        setRequiresMinSearchLength(result.requiresMinSearchLength);
        setResolvedProductLimit(result.productLimit);
      } catch (searchError) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError(searchError instanceof Error ? searchError.message : 'Falha ao buscar destinos');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [productLimit],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setTimeout(() => {
      void runSearch(search, selectedUrl);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, runSearch, search, selectedUrl]);

  return {
    targets,
    loading,
    error,
    search,
    setSearch,
    requiresMinSearchLength,
    productLimit: resolvedProductLimit,
  };
}

export function useInternalLinkTargetsForList(enabled: boolean): {
  targets: InternalLinkTarget[];
  loading: boolean;
} {
  const [targets, setTargets] = useState<InternalLinkTarget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    void searchInternalLinkTargetsClient({ search: '' })
      .then((result) => setTargets(result.targets))
      .catch(() => setTargets([]))
      .finally(() => setLoading(false));
  }, [enabled]);

  return { targets, loading };
}
