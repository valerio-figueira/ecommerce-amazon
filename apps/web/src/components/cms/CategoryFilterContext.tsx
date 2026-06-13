'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type CategoryFilterContextValue = {
  categorySlug: string | null;
  setCategorySlug: (slug: string | null) => void;
};

const CategoryFilterContext = createContext<CategoryFilterContextValue | null>(null);

export function CategoryFilterProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const value = useMemo(
    () => ({ categorySlug, setCategorySlug }),
    [categorySlug],
  );
  return <CategoryFilterContext.Provider value={value}>{children}</CategoryFilterContext.Provider>;
}

export function useCategoryFilter(): CategoryFilterContextValue {
  const ctx = useContext(CategoryFilterContext);
  if (!ctx) {
    throw new Error('useCategoryFilter must be used within CategoryFilterProvider');
  }
  return ctx;
}

export function useOptionalCategoryFilter(): CategoryFilterContextValue | null {
  return useContext(CategoryFilterContext);
}
