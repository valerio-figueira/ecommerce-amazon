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
        'group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-neutral-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="relative">
        <Link href={detailHref} className="relative block aspect-square overflow-hidden rounded-2xl bg-[var(--muted)]">
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
        </Link>
        <button
          type="button"
          aria-label={saved ? 'Remover da lista' : 'Salvar na lista'}
          className="absolute right-2 top-2 z-20 rounded-full bg-white/90 p-2 shadow-sm"
          onClick={toggleWishlist}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-orange-500 text-orange-500')} />
        </button>
      </div>
      <div className="relative mt-3 flex flex-1 flex-col gap-1.5">
        <MarketplaceBadge marketplace={product.marketplace} className="w-fit" />
        <Link href={detailHref} className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-snug hover:underline">
          {product.title}
        </Link>
        {variant === 'default' && (
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
        )}
        <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
        <ProductCardActions
          product={product}
          sessionId={sessionId}
          blockId={blockId}
        />
      </div>
    </article>
  );
}
