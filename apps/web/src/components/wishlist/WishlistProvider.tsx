'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, apiFetchParsed } from '@/lib/api/client';
import { checkoutBatch } from '@/lib/api/wishlist';
import { wishlistResponseSchema } from '@/lib/api/schemas';
import type { WishlistItemDto } from '@/lib/api/schemas';
import { clearSessionCookie, getOrCreateSessionId } from '@/lib/session';
import { useCookieConsent } from '@/components/legal/CookieConsentProvider';

type WishlistContextValue = {
  items: WishlistItemDto[];
  sessionId: string;
  consentGranted: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  checkoutBatch: (marketplace: string) => Promise<{ url: string; itemCount: number }>;
  isInWishlist: (productId: string) => boolean;
  requestConsent: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { consentGranted, requestConsent } = useCookieConsent();
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isOpen, setOpen] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    if (!sessionId) return;
    const data = await apiFetchParsed('/wishlist', wishlistResponseSchema, { sessionId });
    setItems(data.items);
  }, [sessionId]);

  useEffect(() => {
    if (!consentGranted) {
      setSessionId('');
      setItems([]);
      return;
    }
    setSessionId(getOrCreateSessionId());
  }, [consentGranted]);

  useEffect(() => {
    if (sessionId) {
      void refresh();
    }
  }, [sessionId, refresh]);

  const addItem = useCallback(
    async (productId: string): Promise<void> => {
      if (!consentGranted || !sessionId) {
        requestConsent();
        return;
      }
      await apiFetch('/wishlist', {
        method: 'POST',
        sessionId,
        body: JSON.stringify({ productId }),
      });
      await refresh();
    },
    [consentGranted, sessionId, requestConsent, refresh],
  );

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      if (!sessionId) return;
      await apiFetch(`/wishlist/${id}`, { method: 'DELETE', sessionId });
      await refresh();
    },
    [sessionId, refresh],
  );

  const clearAll = useCallback(async (): Promise<void> => {
    if (sessionId) {
      await apiFetch('/wishlist', { method: 'DELETE', sessionId });
    }
    clearSessionCookie();
    const nextSessionId = consentGranted ? getOrCreateSessionId() : '';
    setSessionId(nextSessionId);
    setItems([]);
  }, [sessionId, consentGranted]);

  const checkoutBatchForMarketplace = useCallback(
    async (marketplace: string) => {
      if (!sessionId) {
        throw new Error('Session unavailable');
      }
      return checkoutBatch(sessionId, marketplace);
    },
    [sessionId],
  );

  const isInWishlist = useCallback(
    (productId: string): boolean => items.some((item) => item.productId === productId),
    [items],
  );

  const value = useMemo(
    (): WishlistContextValue => ({
      items,
      sessionId,
      consentGranted,
      isOpen,
      setOpen,
      refresh,
      addItem,
      removeItem,
      clearAll,
      checkoutBatch: checkoutBatchForMarketplace,
      isInWishlist,
      requestConsent,
    }),
    [
      items,
      sessionId,
      consentGranted,
      isOpen,
      refresh,
      addItem,
      removeItem,
      clearAll,
      checkoutBatchForMarketplace,
      isInWishlist,
      requestConsent,
    ],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
