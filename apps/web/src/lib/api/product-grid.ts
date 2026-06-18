import { productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema, type ProductsPageDto } from '@/lib/api/schemas';

type ProductGridFetchInput = {
  categorySlug?: string;
  pageSize: number;
  sort: string;
  marketplace?: string;
};

export async function fetchProductGridPage(
  input: ProductGridFetchInput,
): Promise<ProductsPageDto> {
  const queryParams = new URLSearchParams();
  queryParams.set('pageSize', String(input.pageSize));
  if (input.categorySlug) queryParams.set('category', input.categorySlug);
  if (input.marketplace) queryParams.set('marketplace', input.marketplace);
  queryParams.set('sort', input.sort);
  queryParams.set('visibleOnly', 'true');

  return apiFetchParsed(`/products?${queryParams.toString()}`, productsPageSchema);
}

export function parseProductGridFetchInput(
  props: ReturnType<typeof productGridPropsSchema.parse>,
  categorySlug?: string,
): ProductGridFetchInput {
  const resolvedCategory = categorySlug ?? props.categorySlug ?? undefined;

  return {
    pageSize: props.pageSize,
    sort: props.sort,
    ...(props.marketplace ? { marketplace: props.marketplace } : {}),
    ...(resolvedCategory ? { categorySlug: resolvedCategory } : {}),
  };
}
