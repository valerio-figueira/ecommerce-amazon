'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, apiFetchParsed } from '@/lib/api/client';
import { wishlistResponseSchema } from '@/lib/api/schemas';
import type { WishlistItemDto } from '@/lib/api/schemas';
import { getOrCreateSessionId } from '@/lib/session';

type WishlistContextValue = {
  items: WishlistItemDto[];
  sessionId: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<WishlistItemDto[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [isOpen, setOpen] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    if (!sessionId) return;
    const data = await apiFetchParsed('/wishlist', wishlistResponseSchema, { sessionId });
    setItems(data.items);
  }, [sessionId]);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (sessionId) {
      void refresh();
    }
  }, [sessionId, refresh]);

  const addItem = useCallback(
    async (productId: string): Promise<void> => {
      await apiFetch('/wishlist', {
        method: 'POST',
        sessionId,
        body: JSON.stringify({ productId }),
      });
      await refresh();
    },
    [sessionId, refresh],
  );

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      await apiFetch(`/wishlist/${id}`, { method: 'DELETE', sessionId });
      await refresh();
    },
    [sessionId, refresh],
  );

  const isInWishlist = useCallback(
    (productId: string): boolean => items.some((item) => item.productId === productId),
    [items],
  );

  const value = useMemo(
    (): WishlistContextValue => ({
      items,
      sessionId,
      isOpen,
      setOpen,
      refresh,
      addItem,
      removeItem,
      isInWishlist,
    }),
    [items, sessionId, isOpen, refresh, addItem, removeItem, isInWishlist],
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
