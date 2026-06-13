export type CategoryBreadcrumb = {
  slug: string;
  label: string;
};

export type CategoryJsonLdInput = {
  siteBaseUrl: string;
  slug: string;
  label: string;
  seoDescription?: string | undefined;
  breadcrumbs: CategoryBreadcrumb[];
  productCount: number;
};

export function buildCategoryBreadcrumbJsonLd(input: CategoryJsonLdInput): Record<string, unknown> {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: input.siteBaseUrl,
    },
    ...input.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: crumb.label,
      item: `${input.siteBaseUrl}/categorias/${crumb.slug}`,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function buildCategoryCollectionJsonLd(
  input: CategoryJsonLdInput,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.label,
    ...(input.seoDescription ? { description: input.seoDescription } : {}),
    url: `${input.siteBaseUrl}/categorias/${input.slug}`,
    numberOfItems: input.productCount,
  };
}
