'use client';

import Image from 'next/image';

import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import type { ProductListItemDto } from '@/lib/api/types';
import { marketplaceLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

type CollectionProductCardProps = {
  product: ProductListItemDto;
  blockId?: string | undefined;
  utmDefaults?: Record<string, string>;
  className?: string;
};

export function CollectionProductCard({
  product,
  blockId,
  utmDefaults,
  className,
}: CollectionProductCardProps): React.JSX.Element {
  const { sessionId } = useWishlist();
  const marketplace = marketplaceLabel(product.marketplace);

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width:768px) 42vw, 180px"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-700" aria-hidden />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 transition-opacity duration-300 group-hover:from-black/70 group-hover:via-black/20"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 translate-y-0 space-y-2.5 p-3.5 transition-transform duration-300 group-hover:translate-y-[-2px] md:p-4">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white md:text-[15px]">
            {product.title}
          </p>
          <AffiliateGoLink
            productId={product.id}
            slug={product.slug}
            sessionId={sessionId}
            blockId={blockId}
            origin="coleção"
            variant="outline"
            className="w-fit rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm transition-all duration-300 group-hover:scale-[1.03] group-hover:bg-neutral-50 group-hover:shadow-md"
            {...(utmDefaults !== undefined ? { utmDefaults } : {})}
          >
            Ver na {marketplace}
          </AffiliateGoLink>
        </div>
      </div>
    </article>
  );
}
