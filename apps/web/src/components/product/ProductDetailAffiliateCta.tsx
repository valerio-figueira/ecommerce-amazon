'use client';

import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { marketplaceLabel } from '@/lib/format';

type ProductDetailAffiliateCtaProps = {
  productId: string;
  slug: string;
  marketplace: string;
};

export function ProductDetailAffiliateCta({
  productId,
  slug,
  marketplace,
}: ProductDetailAffiliateCtaProps): React.JSX.Element {
  const { sessionId } = useWishlist();

  return (
    <AffiliateGoLink
      productId={productId}
      slug={slug}
      sessionId={sessionId}
      origin="detalhe"
      placement={ClickPlacement.PRODUCT_DETAIL_CTA}
      variant="primary"
      className="px-6 py-3 text-sm md:w-auto"
    >
      Ver preço na {marketplaceLabel(marketplace)}
    </AffiliateGoLink>
  );
}
