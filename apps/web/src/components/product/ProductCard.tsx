'use client';

import { Heart } from 'lucide-react';
import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import { ProductCompareToggle } from '@/components/comparison/ProductCompareToggle';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductCardActions } from '@/components/product/ProductCardActions';
import type { AffiliateClickOrigin } from '@/components/product/AffiliateGoLink';
import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';
import { ProductEditorialBadges } from '@/components/product/ProductEditorialBadges';
import { ProductEditorialProsCons } from '@/components/product/ProductEditorialProsCons';
import { ProductRating } from '@/components/product/ProductRating';
import type { ProductListItemDto } from '@/lib/api/types';
import { computeDiscountPercent } from '@/lib/discount';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: ProductListItemDto;
  className?: string;
  blockId?: string | undefined;
  articleId?: string | undefined;
  collectionId?: string | undefined;
  clickOrigin?: AffiliateClickOrigin;
  placement?: ClickPlacementValue;
  utmDefaults?: Record<string, string>;
  /** Smaller card footprint via shorter image + tighter layout; typography stays default. */
  variant?: 'default' | 'compact' | 'editorial';
  emphasizeDiscount?: boolean;
  pros?: string[] | undefined;
  cons?: string[] | undefined;
  showCompareToggle?: boolean;
};

export function ProductCard({
  product,
  className,
  blockId,
  articleId,
  collectionId,
  clickOrigin = 'listagem',
  placement,
  utmDefaults,
  variant = 'default',
  emphasizeDiscount = false,
  pros,
  cons,
  showCompareToggle = variant !== 'editorial',
}: ProductCardProps): React.JSX.Element {
  const { addItem, removeItem, isInWishlist, items, sessionId } = useWishlist();
  const saved = isInWishlist(product.id);
  const wishlistItem = items.find((item) => item.productId === product.id);
  const detailHref = `/produtos/${product.slug}`;
  const isCompact = variant === 'compact';
  const isEditorial = variant === 'editorial';
  const discountPercent = emphasizeDiscount
    ? computeDiscountPercent(product.price.amount, product.price.strikethrough)
    : null;
  const showDiscountBadge = discountPercent !== null && !product.price.isStale;
  const compareItem = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    ...(product.imageUrl !== undefined ? { imageUrl: product.imageUrl } : {}),
    ...(product.categoryId !== undefined ? { categoryId: product.categoryId } : {}),
    ...(product.categorySlug !== undefined ? { categorySlug: product.categorySlug } : {}),
    ...(product.categoryLabel !== undefined ? { categoryLabel: product.categoryLabel } : {}),
  };

  const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (saved && wishlistItem) {
      void removeItem(wishlistItem.id);
    } else {
      void addItem(product.id);
    }
  };

  if (isEditorial) {
    return (
      <article
        className={cn(
          'group relative overflow-hidden rounded-[var(--radius)] border border-neutral-200 bg-white p-3 shadow-sm sm:p-4',
          className,
        )}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-28 shrink-0 self-start sm:w-40">
            <Link
              href={detailHref}
              className="relative block aspect-square w-full overflow-hidden rounded-xl bg-[var(--muted)]"
            >
              {product.imageUrl && (
                <RemoteImage
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width:640px) 112px, 160px"
                />
              )}
              <ProductEditorialBadges product={product} />
              <MarketplaceBadge
                marketplace={product.marketplace}
                className="absolute bottom-1 left-1 z-10 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold shadow-sm backdrop-blur-sm sm:bottom-1.5 sm:left-1.5 sm:px-2 sm:text-xs"
              />
            </Link>
            <button
              type="button"
              aria-label={saved ? 'Remover da lista' : 'Salvar na lista'}
              className="absolute right-1 top-1 z-20 rounded-full bg-white/90 p-1 shadow-sm sm:right-1.5 sm:top-1.5 sm:p-1.5"
              onClick={toggleWishlist}
            >
              <Heart className={cn('h-3.5 w-3.5', saved && 'fill-orange-500 text-orange-500')} />
            </button>
            {showCompareToggle ? (
              <ProductCompareToggle
                product={compareItem}
                className="absolute bottom-1 right-1 z-20 sm:bottom-1.5 sm:right-1.5"
              />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 self-start sm:gap-2">
            <Link
              href={detailHref}
              className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 hover:underline sm:text-base"
            >
              {product.title}
            </Link>
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} compact />
            <PriceDisplay
              price={product.price}
              strikethrough={product.price.strikethrough}
              compact
            />
            <ProductEditorialProsCons
              pros={pros}
              cons={cons}
              maxPros={2}
              maxCons={1}
              className="text-xs sm:text-sm"
            />
          </div>
          <ProductCardActions
            product={product}
            sessionId={sessionId}
            blockId={blockId}
            articleId={articleId}
            collectionId={collectionId}
            clickOrigin={clickOrigin}
            {...(placement !== undefined ? { placement } : {})}
            editorial
            {...(utmDefaults !== undefined ? { utmDefaults } : {})}
          />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md',
        !isCompact && 'h-full',
        className,
      )}
    >
      <div className="relative shrink-0">
        <Link
          href={detailHref}
          className={cn(
            'relative block overflow-hidden bg-[var(--muted)]',
            isCompact ? 'aspect-[4/3]' : 'aspect-square',
          )}
        >
          {product.imageUrl && (
            <RemoteImage
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isCompact ? '(max-width:768px) 40vw, 18vw' : '(max-width:768px) 50vw, 25vw'}
            />
          )}
          {showDiscountBadge ? (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              −{discountPercent}%
            </span>
          ) : (
            <ProductEditorialBadges product={product} />
          )}
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
        {showCompareToggle ? (
          <ProductCompareToggle
            product={compareItem}
            className="absolute bottom-1.5 right-1.5 z-20"
          />
        ) : null}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col px-2 pb-2 pt-2">
        <div className="flex shrink-0 flex-col gap-0.5">
          <Link
            href={detailHref}
            className="block min-w-0 truncate shrink-0 text-sm font-semibold leading-snug hover:underline"
          >
            {product.title}
          </Link>
          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="shrink-0"
            compact={isCompact}
          />
        </div>
        {isCompact ? <div className="min-h-0 flex-1" aria-hidden /> : null}
        <div className={cn('flex shrink-0 flex-col gap-1.5', isCompact ? 'mt-1.5' : 'mt-2')}>
          <PriceDisplay
            price={product.price}
            strikethrough={product.price.strikethrough}
            compact={isCompact}
          />
          <ProductCardActions
            product={product}
            sessionId={sessionId}
            blockId={blockId}
            articleId={articleId}
            collectionId={collectionId}
            clickOrigin={clickOrigin}
            {...(placement !== undefined ? { placement } : {})}
            compact={isCompact}
            {...(utmDefaults !== undefined ? { utmDefaults } : {})}
          />
        </div>
      </div>
    </article>
  );
}
