export type CuratedCollectionJsonLdInput = {
  siteBaseUrl: string;
  slug: string;
  title: string;
  description: string;
  productCount: number;
  updatedAt?: string | undefined;
};

export function buildCuratedCollectionJsonLd(
  input: CuratedCollectionJsonLdInput,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.title,
    description: input.description,
    url: `${input.siteBaseUrl}/colecoes/${input.slug}`,
    numberOfItems: input.productCount,
    ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
  };
}

export function buildCuratedCollectionBreadcrumbJsonLd(
  input: Pick<CuratedCollectionJsonLdInput, 'siteBaseUrl' | 'slug' | 'title'>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: input.siteBaseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Coleções',
        item: `${input.siteBaseUrl}/colecoes/${input.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: input.title,
        item: `${input.siteBaseUrl}/colecoes/${input.slug}`,
      },
    ],
  };
}
