'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { RemoteImage } from '@/components/ui/RemoteImage';

import { PriceDisplay } from '@/components/product/PriceDisplay';
import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { Button } from '@/components/ui/button';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import {
  marketplaceLabel,
  marketplaceWithDefiniteArticle,
  marketplaceWithPreposition,
} from '@/lib/format';
import { ApiError } from '@/lib/api/client';

function openBatchCheckoutUrls(marketplace: string, url: string): void {
  if (marketplace === 'amazon_br') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const urls = url.split('|').filter((entry) => entry.length > 0);
  if (urls.length === 0) return;

  window.alert(
    `Abriremos ${urls.length} abas ${marketplaceWithPreposition(marketplace)} — uma por produto. Compras finalizadas lá.`,
  );

  urls.forEach((entry, index) => {
    window.setTimeout(() => {
      window.open(entry, '_blank', 'noopener,noreferrer');
    }, index * 500);
  });
}

export function WishlistDrawer(): React.JSX.Element | null {
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    sessionId,
    consentGranted,
    checkoutBatch,
    clearAll,
    requestConsent,
  } = useWishlist();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  if (!isOpen) return null;

  const byMarketplace = items.reduce<Record<string, typeof items>>((acc, item) => {
    const list = acc[item.marketplace] ?? [];
    list.push(item);
    acc[item.marketplace] = list;
    return acc;
  }, {});

  const handleBatchCheckout = async (marketplace: string, itemCount: number): Promise<void> => {
    if (!consentGranted) {
      requestConsent();
      return;
    }

    setCheckoutError(null);
    setCheckoutLoading(marketplace);
    try {
      const result = await checkoutBatch(marketplace);
      if (result.itemCount === 0 || itemCount === 0) {
        setCheckoutError('Nenhum item disponível para checkout nesta loja.');
        return;
      }
      openBatchCheckoutUrls(marketplace, result.url);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setCheckoutError(
          'Checkout em lote indisponível no momento. Tente novamente mais tarde ou abra os itens individualmente.',
        );
      } else {
        setCheckoutError('Não foi possível preparar o checkout. Tente novamente.');
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleClearAll = async (): Promise<void> => {
    setClearing(true);
    try {
      await clearAll();
      setConfirmClear(false);
    } finally {
      setClearing(false);
    }
  };

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
                        <RemoteImage
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
                          <AffiliateGoLink
                            productId={item.productId}
                            slug={item.product.slug}
                            sessionId={sessionId}
                            origin="listagem"
                            placement={ClickPlacement.WISHLIST_DRAWER}
                            variant="primary"
                            className="w-auto px-3 py-1.5 text-sm"
                          >
                            Ver oferta
                          </AffiliateGoLink>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void removeItem(item.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full"
                    disabled={
                      !consentGranted || group.length === 0 || checkoutLoading === marketplace
                    }
                    onClick={() => void handleBatchCheckout(marketplace, group.length)}
                  >
                    {checkoutLoading === marketplace
                      ? 'Preparando checkout…'
                      : `Finalizar ${marketplaceWithPreposition(marketplace)} (${group.length} itens)`}
                  </Button>
                  <p className="text-xs text-neutral-500">
                    Abriremos {marketplaceWithDefiniteArticle(marketplace)} com seus itens. Compras
                    finalizadas lá.
                  </p>
                </div>
              </div>
            ))
          )}
          {checkoutError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {checkoutError}
            </p>
          )}
        </div>
        <div className="space-y-3 border-t p-4 text-xs text-neutral-500">
          <p>Compras finalizadas no marketplace. Links organizados por loja.</p>
          {!confirmClear ? (
            <button
              type="button"
              className="text-sm font-medium text-neutral-700 underline"
              onClick={() => setConfirmClear(true)}
            >
              Apagar minha lista
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-neutral-700">
                Isso remove todos os produtos salvos neste navegador.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={clearing}
                  onClick={() => void handleClearAll()}
                >
                  {clearing ? 'Apagando…' : 'Confirmar'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
