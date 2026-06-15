import { fetchOrNotFound } from '@/lib/api/safe-fetch';
import { curatedCollectionDetailSchema, type CuratedCollectionDetailDto } from './schemas';

export type { CuratedCollectionDetailDto };
export { curatedCollectionDetailSchema };

export async function fetchCuratedCollection(
  slug: string,
): Promise<CuratedCollectionDetailDto | null> {
  return fetchOrNotFound(`/collections/${slug}`, curatedCollectionDetailSchema);
}
