'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  type ComparisonSelectionItem,
  type ComparisonToastMessage,
  type ComparisonToggleInput,
  type ComparisonToggleResult,
  readComparisonSelection,
  toggleComparisonSelection,
  writeComparisonSelection,
} from '@/components/comparison/comparison-storage';

type ComparisonContextValue = {
  items: ComparisonSelectionItem[];
  isHydrated: boolean;
  count: number;
  activeCategoryLabel: string | null;
  toast: ComparisonToastMessage | null;
  dismissToast: () => void;
  toggleProduct: (item: ComparisonToggleInput) => ComparisonToggleResult;
  removeProduct: (productId: string) => void;
  clear: () => void;
  isSelected: (productId: string) => boolean;
  canAddProduct: (item: ComparisonToggleInput) => boolean;
};

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

function resolveCategoryMismatchMessage(activeLabel: string | null): string {
  if (activeLabel) {
    return `Você só pode comparar produtos da mesma categoria (ex.: ${activeLabel}).`;
  }
  return 'Você só pode comparar produtos da mesma categoria.';
}

export function ComparisonProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [items, setItems] = useState<ComparisonSelectionItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<ComparisonToastMessage | null>(null);

  useEffect(() => {
    setItems(readComparisonSelection());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeComparisonSelection(items);
  }, [items, isHydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeCategoryLabel = useMemo(() => {
    if (items.length === 0) return null;
    return items[0]?.categoryLabel ?? items[0]?.categorySlug ?? null;
  }, [items]);

  const dismissToast = useCallback((): void => {
    setToast(null);
  }, []);

  const toggleProduct = useCallback(
    (candidate: ComparisonToggleInput): ComparisonToggleResult => {
      let nextResult: ComparisonToggleResult = { ok: true };
      setItems((current) => {
        const outcome = toggleComparisonSelection(current, candidate);
        nextResult = outcome.result;
        return outcome.items;
      });

      if ('reason' in nextResult) {
        if (nextResult.reason === 'category_mismatch') {
          setToast({
            variant: 'warning',
            text: resolveCategoryMismatchMessage(activeCategoryLabel),
          });
        } else if (nextResult.reason === 'max_reached') {
          setToast({
            variant: 'info',
            text: 'Você já selecionou 3 produtos para comparar.',
          });
        }
      }

      return nextResult;
    },
    [activeCategoryLabel],
  );

  const removeProduct = useCallback((productId: string): void => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback((): void => {
    setItems([]);
  }, []);

  const isSelected = useCallback(
    (productId: string): boolean => items.some((item) => item.productId === productId),
    [items],
  );

  const canAddProduct = useCallback(
    (candidate: ComparisonToggleInput): boolean => {
      if (items.some((item) => item.productId === candidate.productId)) return true;
      if (items.length >= 3) return false;
      if (items.length === 0) return true;
      const activeKey = items[0]?.categoryId ?? items[0]?.categorySlug ?? '__none__';
      const candidateKey = candidate.categoryId ?? candidate.categorySlug ?? '__none__';
      return activeKey === candidateKey;
    },
    [items],
  );

  const value = useMemo<ComparisonContextValue>(
    () => ({
      items,
      isHydrated,
      count: items.length,
      activeCategoryLabel,
      toast,
      dismissToast,
      toggleProduct,
      removeProduct,
      clear,
      isSelected,
      canAddProduct,
    }),
    [
      items,
      isHydrated,
      activeCategoryLabel,
      toast,
      dismissToast,
      toggleProduct,
      removeProduct,
      clear,
      isSelected,
      canAddProduct,
    ],
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison(): ComparisonContextValue {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}

export function useComparisonOptional(): ComparisonContextValue | null {
  return useContext(ComparisonContext);
}
