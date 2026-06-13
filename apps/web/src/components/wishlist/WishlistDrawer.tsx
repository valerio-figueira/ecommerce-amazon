'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

import { PriceDisplay } from '@/components/product/PriceDisplay';
import { Button } from '@/components/ui/button';
import { recordClick } from '@/lib/api/events';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { marketplaceLabel } from '@/lib/format';

export function WishlistDrawer(): React.JSX.Element | null {
  const { items, isOpen, setOpen, removeItem, sessionId } = useWishlist();

  if (!isOpen) return null;

  const byMarketplace = items.reduce<Record<string, typeof items>>((acc, item) => {
    const list = acc[item.marketplace] ?? [];
    list.push(item);
    acc[item.marketplace] = list;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar lista"
        onClick={() => setOpen(false)}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="text-lg font-bold">Sua lista ({items.length})</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum produto salvo ainda.</p>
          ) : (
            Object.entries(byMarketplace).map(([marketplace, group]) => (
              <div key={marketplace} className="mb-6">
                <h3 className="mb-3 text-sm font-semibold">{marketplaceLabel(marketplace)}</h3>
                <ul className="space-y-3">
                  {group.map((item) => (
                    <li key={item.id} className="flex gap-3 rounded-2xl bg-neutral-50 p-3">
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="line-clamp-2 text-sm font-medium">{item.product.title}</p>
                        <PriceDisplay price={{ ...item.product.price, updatedAt: item.addedAt }} />
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              void recordClick(item.productId, 'listagem', sessionId);
                              window.open(item.product.affiliateUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            Ver oferta
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void removeItem(item.id)}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-4 text-xs text-neutral-500">
          Compras finalizadas no marketplace. Links organizados por loja.
        </div>
      </aside>
    </div>
  );
}
