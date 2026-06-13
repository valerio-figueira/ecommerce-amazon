'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { featuredProductPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { MarketplaceBadge } from '@/components/product/MarketplaceBadge';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { Button } from '@/components/ui/button';
import { recordClick } from '@/lib/api/events';
import { apiFetchParsed } from '@/lib/api/client';
import { productListItemSchema } from '@/lib/api/schemas';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { marketplaceLabel } from '@/lib/format';

export function FeaturedProductBlock({ block }: BlockComponentProps): React.JSX.Element | null {
  const props = featuredProductPropsSchema.parse(block.props);
  const { sessionId } = useWishlist();

  const slug = props.productSlug;
  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiFetchParsed(`/products/${slug ?? ''}`, productListItemSchema),
    enabled: Boolean(slug),
  });

  if (!product) {
    return (
      <div className="flex h-full min-h-[320px] animate-pulse items-center justify-center rounded-[var(--radius)] bg-white">
        Carregando...
      </div>
    );
  }

  const ctaLabel = props.ctaLabel ?? `Ver na ${marketplaceLabel(product.marketplace)}`;

  return (
    <div className="flex h-full min-h-[240px] flex-col rounded-[var(--radius)] bg-white p-4 shadow-sm">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[var(--muted)]">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
        )}
      </div>
      <div className="mt-4 flex shrink-0 flex-col gap-2">
        <h3 className="text-lg font-bold">{product.title}</h3>
        {props.showMarketplaceBadge && <MarketplaceBadge marketplace={product.marketplace} />}
        <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} />
        <Button
          className="w-full"
          onClick={() => {
            void recordClick(product.id, 'listagem', sessionId);
            window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
