import { apiFetchParsed, isNotFoundError } from '@/lib/api/client';
import { productsPageSchema, type ProductListItemDto } from '@/lib/api/schemas';
import { VITRINE_LISTING_PAGE_SIZE } from '@/lib/listing';

export type CategoryProductsResult = {
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  error: boolean;
};

export async function getCategoryProducts(
  slug: string,
  page: number,
): Promise<CategoryProductsResult> {
  try {
    const params = new URLSearchParams({
      category: slug,
      visibleOnly: 'true',
      pageSize: String(VITRINE_LISTING_PAGE_SIZE),
      page: String(page),
    });
    const result = await apiFetchParsed(`/products?${params.toString()}`, productsPageSchema);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      error: false,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return { items: [], total: 0, page, pageSize: VITRINE_LISTING_PAGE_SIZE, error: false };
    }
    return { items: [], total: 0, page, pageSize: VITRINE_LISTING_PAGE_SIZE, error: true };
  }
}
