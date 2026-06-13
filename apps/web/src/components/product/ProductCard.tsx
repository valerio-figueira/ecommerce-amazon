'use client';

import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductCardActions } from '@/components/product/ProductCardActions';
import { ProductEditorialBadges } from '@/components/product/ProductEditorialBadges';
import { ProductRating } from '@/components/product/ProductRating';
import type { ProductListItemDto } from '@/lib/api/types';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: ProductListItemDto;
  className?: string;
  blockId?: string | undefined;
  variant?: 'default' | 'compact';
};

export function ProductCard({
  product,
  className,
  blockId,
  variant = 'default',
}: ProductCardProps): React.JSX.Element {
  const { addItem, removeItem, isInWishlist, items, sessionId } = useWishlist();
  const saved = isInWishlist(product.id);
  const wishlistItem = items.find((item) => item.productId === product.id);
  const detailHref = `/produtos/${product.slug}`;

  const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (saved && wishlistItem) {
      void removeItem(wishlistItem.id);
    } else {
      void addItem(product.id);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-neutral-100 bg-white p-2 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="relative shrink-0">
        <Link
          href={detailHref}
          className="relative block aspect-square overflow-hidden rounded-xl bg-[var(--muted)]"
        >
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 25vw"
            />
          )}
          <ProductEditorialBadges product={product} />
          <MarketplaceBadge
            marketplace={product.marketplace}
            className="absolute bottom-1.5 left-1.5 z-10 rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm"
          />
        </Link>
        <button
          type="button"
          aria-label={saved ? 'Remover da lista' : 'Salvar na lista'}
          className="absolute right-1.5 top-1.5 z-20 rounded-full bg-white/90 p-1.5 shadow-sm"
          onClick={toggleWishlist}
        >
          <Heart className={cn('h-3.5 w-3.5', saved && 'fill-orange-500 text-orange-500')} />
        </button>
      </div>
      <div className="relative mt-2 flex min-h-0 flex-1 flex-col gap-0.5">
        <Link
          href={detailHref}
          className="line-clamp-2 h-10 shrink-0 text-sm font-semibold leading-snug hover:underline"
        >
          {product.title}
        </Link>
        {variant === 'default' && (
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="shrink-0"
          />
        )}
        <div className="mt-auto flex flex-col gap-1">
          <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
          <ProductCardActions
            product={product}
            sessionId={sessionId}
            blockId={blockId}
          />
        </div>
      </div>
    </article>
  );
}
