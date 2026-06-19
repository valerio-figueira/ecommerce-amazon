import {
  comparisonPublicDetailSchema,
  createComparisonResponseSchema,
} from '@ecommerce-amazon/shared/comparison';
import { buildComparisonEditorialIntro } from '@ecommerce-amazon/shared/comparison';

import { apiFetchParsed } from '@/lib/api/client';
import { getOrCreateSessionId } from '@/lib/session';

export async function getComparisonByIdentifier(identifier: string) {
  return apiFetchParsed(`/comparisons/${identifier}`, comparisonPublicDetailSchema);
}

export async function createComparison(input: {
  productIds: string[];
  products: Array<{
    title: string;
    marketplace: string;
    editorialScore: number;
  }>;
  categoryLabel?: string | undefined;
  sessionId?: string;
}) {
  const editorialIntro = buildComparisonEditorialIntro({
    products: input.products,
    categoryLabel: input.categoryLabel,
  });

  return apiFetchParsed('/comparisons', createComparisonResponseSchema, {
    method: 'POST',
    sessionId: input.sessionId ?? getOrCreateSessionId(),
    body: JSON.stringify({
      productIds: input.productIds,
      editorialIntro,
    }),
  });
}
