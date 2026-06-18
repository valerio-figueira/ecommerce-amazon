import { featuredProductPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { FeaturedProductBlock } from '@/components/blocks/FeaturedProductBlock';
import { apiFetchParsed } from '@/lib/api/client';
import { productListItemSchema } from '@/lib/api/schemas';

export async function FeaturedProductBlockServer(
  props: BlockComponentProps,
): Promise<React.JSX.Element | null> {
  const blockProps = featuredProductPropsSchema.parse(props.block.props);
  const slug = blockProps.productSlug;

  if (!slug) {
    return <FeaturedProductBlock {...props} />;
  }

  try {
    const initialProduct = await apiFetchParsed(`/products/${slug}`, productListItemSchema);
    return <FeaturedProductBlock {...props} initialProduct={initialProduct} />;
  } catch {
    return <FeaturedProductBlock {...props} />;
  }
}
