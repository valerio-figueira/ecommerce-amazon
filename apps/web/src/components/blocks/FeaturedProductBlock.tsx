'use client';

import { useQuery } from '@tanstack/react-query';
import { RemoteImage } from '@/components/ui/RemoteImage';
import Link from 'next/link';

import { featuredProductPropsSchema } from '@ecommerce-amazon/shared/cms';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { BlockErrorFallback } from '@/components/errors/BlockErrorFallback';
import { BlockUnavailableFallback } from '@/components/errors/BlockUnavailableFallback';
import { ProductCardSkeleton } from '@/components/loading/ProductCardSkeleton';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductCardActions } from '@/components/product/ProductCardActions';
import { ProductEditorialBadges } from '@/components/product/ProductEditorialBadges';
import { ProductRating } from '@/components/product/ProductRating';
import { apiFetchParsed } from '@/lib/api/client';
import { productListItemSchema, type ProductListItemDto } from '@/lib/api/schemas';
import { useWishlist } from '@/components/wishlist/WishlistProvider';

const FEATURED_MIN_HEIGHT = 'min-h-[320px]';

type FeaturedProductBlockProps = BlockComponentProps & {
  initialProduct?: ProductListItemDto;
};

export function FeaturedProductBlock({
  block,
  initialProduct,
}: FeaturedProductBlockProps): React.JSX.Element | null {
  const props = featuredProductPropsSchema.parse(block.props);
  const { sessionId } = useWishlist();

  const slug = props.productSlug;
  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiFetchParsed(`/products/${slug ?? ''}`, productListItemSchema),
    enabled: Boolean(slug),
    initialData: initialProduct,
    staleTime: 0,
  });

  if (!slug) {
    return <BlockUnavailableFallback className={FEATURED_MIN_HEIGHT} />;
  }

  if (isLoading) {
    return (
      <div
        className={`flex h-full ${FEATURED_MIN_HEIGHT} flex-col rounded-[var(--radius)] border border-neutral-100 bg-white p-4 shadow-sm`}
      >
        <ProductCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <BlockErrorFallback onRetry={() => void refetch()} className={FEATURED_MIN_HEIGHT} />;
  }

  if (!product) {
    return <BlockUnavailableFallback className={FEATURED_MIN_HEIGHT} />;
  }

  if (product.visible === false) {
    return null;
  }

  const detailHref = `/produtos/${product.slug}`;

  return (
    <div
      className={`flex h-full ${FEATURED_MIN_HEIGHT} flex-col rounded-[var(--radius)] border border-neutral-100 bg-white p-4 shadow-sm`}
    >
      <Link
        href={detailHref}
        className="relative block min-h-[180px] flex-1 overflow-hidden rounded-2xl bg-white"
      >
        {product.imageUrl && (
          <RemoteImage src={product.imageUrl} alt={product.title} fill className="object-contain" />
        )}
        <ProductEditorialBadges product={product} />
      </Link>
      <div className="mt-4 flex shrink-0 flex-col gap-2">
        {props.showMarketplaceBadge && <MarketplaceBadge marketplace={product.marketplace} />}
        <Link href={detailHref} className="text-lg font-bold hover:underline">
          {product.title}
        </Link>
        <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
        <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
        <ProductCardActions
          product={product}
          sessionId={sessionId}
          blockId={block.id}
          placement={ClickPlacement.CMS_FEATURED_PRODUCT}
        />
      </div>
    </div>
  );
}
