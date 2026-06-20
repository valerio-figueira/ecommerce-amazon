import { productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { ProductGridBlock } from '@/components/blocks/ProductGridBlock';
import { fetchProductGridPage, parseProductGridFetchInput } from '@/lib/api/product-grid';

export async function ProductGridBlockServer(
  props: BlockComponentProps,
): Promise<React.JSX.Element> {
  const gridProps = productGridPropsSchema.parse(props.block.props);
  const initialProducts = await fetchProductGridPage(parseProductGridFetchInput(gridProps));

  return <ProductGridBlock {...props} initialProducts={initialProducts} />;
}
