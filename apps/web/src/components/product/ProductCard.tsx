'use client';

import { buildGoUrl } from '@/lib/go-url';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import type { ProductListItemDto } from '@/lib/api/types';
import { Heart } from 'lucide-react';
import Image from 'next/image';

import { PriceDisplay } from '@/components/product/PriceDisplay';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { marketplaceLabel } from '@/lib/format';

type ProductCardProps = {
  product: ProductListItemDto;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps): React.JSX.Element {
  const { addItem, removeItem, isInWishlist, items, sessionId } = useWishlist();
  const saved = isInWishlist(product.id);
  const wishlistItem = items.find((item) => item.productId === product.id);

  const handleCta = (): void => {
    window.open(buildGoUrl(product.slug, { sessionId }), '_blank', 'noopener,noreferrer');
  };

  const toggleWishlist = (): void => {
    if (saved && wishlistItem) {
      void removeItem(wishlistItem.id);
    } else {
      void addItem(product.id);
    }
  };

  return (
    <article className={cn('group flex flex-col rounded-[var(--radius)] bg-white p-3 shadow-sm', className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--muted)]">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        )}
        <button
          type="button"
          aria-label={saved ? 'Remover da lista' : 'Salvar na lista'}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm"
          onClick={toggleWishlist}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-orange-500 text-orange-500')} />
        </button>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
        <Button className="mt-auto w-full" size="sm" onClick={handleCta}>
          Ver na {marketplaceLabel(product.marketplace)}
        </Button>
      </div>
    </article>
  );
}
