import { apiFetchParsed } from './client';
import { curatedCollectionDetailSchema, type CuratedCollectionDetailDto } from './schemas';

export type { CuratedCollectionDetailDto };
export { curatedCollectionDetailSchema };

export async function fetchCuratedCollection(
  slug: string,
): Promise<CuratedCollectionDetailDto | null> {
  try {
    return await apiFetchParsed(`/collections/${slug}`, curatedCollectionDetailSchema);
  } catch {
    return null;
  }
}
