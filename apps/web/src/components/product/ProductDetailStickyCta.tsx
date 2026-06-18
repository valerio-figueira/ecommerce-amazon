'use client';

import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { marketplaceLabel } from '@/lib/format';

type ProductDetailStickyCtaProps = {
  productId: string;
  slug: string;
  marketplace: string;
};

export function ProductDetailStickyCta({
  productId,
  slug,
  marketplace,
}: ProductDetailStickyCtaProps): React.JSX.Element {
  const { sessionId } = useWishlist();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur pb-safe md:hidden">
      <div className="mx-auto max-w-5xl">
        <AffiliateGoLink
          productId={productId}
          slug={slug}
          sessionId={sessionId}
          origin="detalhe"
          placement={ClickPlacement.PRODUCT_DETAIL_CTA}
          variant="primary"
          className="w-full px-6 py-3 text-sm"
        >
          Ver preço na {marketplaceLabel(marketplace)}
        </AffiliateGoLink>
        <p className="mt-2 text-center text-[10px] text-neutral-500">
          Link comercial transparente. Preço pode variar no marketplace parceiro.
        </p>
      </div>
    </div>
  );
}
