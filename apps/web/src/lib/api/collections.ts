import { fetchOrNotFound } from '@/lib/api/safe-fetch';
import { VITRINE_LISTING_PAGE_SIZE } from '@/lib/listing';
import { curatedCollectionDetailSchema, type CuratedCollectionDetailDto } from './schemas';

export type { CuratedCollectionDetailDto };
export { curatedCollectionDetailSchema };

export async function fetchCuratedCollection(
  slug: string,
  options?: { page?: number; pageSize?: number },
): Promise<CuratedCollectionDetailDto | null> {
  const params = new URLSearchParams();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? VITRINE_LISTING_PAGE_SIZE;
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  return fetchOrNotFound(`/collections/${slug}?${params.toString()}`, curatedCollectionDetailSchema);
}
