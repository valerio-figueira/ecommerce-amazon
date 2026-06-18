import { autoLinksResponseSchema } from '@ecommerce-amazon/shared/admin';

import { apiFetchParsed } from '@/lib/api/client';

export async function getAutoLinks() {
  try {
    return await apiFetchParsed('/seo/auto-links', autoLinksResponseSchema, {
      next: { revalidate: 3600 },
    });
  } catch {
    return { items: [] };
  }
}
