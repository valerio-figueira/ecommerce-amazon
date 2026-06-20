'use client';

import { createContext, useContext, useTransition, type ReactNode } from 'react';

type ArticleListingPendingContextValue = {
  isPending: boolean;
  startListingTransition: (callback: () => void) => void;
};

const ArticleListingPendingContext = createContext<ArticleListingPendingContextValue | null>(null);

export function ArticleListingPendingProvider({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  return (
    <ArticleListingPendingContext.Provider
      value={{ isPending, startListingTransition: startTransition }}
    >
      {children}
    </ArticleListingPendingContext.Provider>
  );
}

export function useArticleListingPending(): ArticleListingPendingContextValue {
  const context = useContext(ArticleListingPendingContext);
  if (!context) {
    throw new Error('useArticleListingPending must be used within ArticleListingPendingProvider');
  }
  return context;
}
