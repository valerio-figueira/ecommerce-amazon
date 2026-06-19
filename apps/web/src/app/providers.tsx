'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { CookieConsentProvider } from '@/components/legal/CookieConsentProvider';
import { CompareBar } from '@/components/comparison/CompareBar';
import { CompareToast } from '@/components/comparison/CompareToast';
import { ComparisonProvider } from '@/components/comparison/ComparisonProvider';
import { SearchProvider } from '@/components/search/SearchProvider';
import { WishlistProvider } from '@/components/wishlist/WishlistProvider';

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsentProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <SearchProvider>
              {children}
              <CompareBar />
              <CompareToast />
            </SearchProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}
