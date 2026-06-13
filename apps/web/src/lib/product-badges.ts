import type { ProductListItemDto } from '@/lib/api/types';

export type EditorialBadgeType = 'editors_pick' | 'top_rated' | 'best_offer';

export type EditorialBadge = {
  type: EditorialBadgeType;
  label: string;
};

const EDITORS_PICK_THRESHOLD = 80;
const TOP_RATED_MIN_RATING = 4.5;
const TOP_RATED_MIN_REVIEWS = 50;

export function resolveEditorialBadge(product: ProductListItemDto): EditorialBadge | null {
  if (product.price.isStale || product.price.amount === null) {
    if (product.editorialScore >= EDITORS_PICK_THRESHOLD) {
      return { type: 'editors_pick', label: 'Escolha editorial' };
    }
    if (
      product.rating !== undefined &&
      product.reviewCount !== undefined &&
      product.rating >= TOP_RATED_MIN_RATING &&
      product.reviewCount >= TOP_RATED_MIN_REVIEWS
    ) {
      return { type: 'top_rated', label: 'Top avaliado' };
    }
    return null;
  }

  if (product.editorialScore >= EDITORS_PICK_THRESHOLD) {
    return { type: 'editors_pick', label: 'Escolha editorial' };
  }
  if (
    product.rating !== undefined &&
    product.reviewCount !== undefined &&
    product.rating >= TOP_RATED_MIN_RATING &&
    product.reviewCount >= TOP_RATED_MIN_REVIEWS
  ) {
    return { type: 'top_rated', label: 'Top avaliado' };
  }
  if (product.price.strikethrough !== undefined) {
    return { type: 'best_offer', label: 'Melhor oferta' };
  }

  return null;
}

export function formatHoursSinceUpdated(updatedAt: string): string {
  const hours = Math.max(
    1,
    Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60)),
  );
  if (hours < 24) {
    return `Monitorado há ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `Monitorado há ${days} dia${days === 1 ? '' : 's'}`;
}
