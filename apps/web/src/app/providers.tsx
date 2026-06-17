'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { CookieConsentProvider } from '@/components/legal/CookieConsentProvider';
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
        <WishlistProvider>{children}</WishlistProvider>
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}
