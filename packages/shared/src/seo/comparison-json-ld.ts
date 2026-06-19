export type ComparisonJsonLdInput = {
  siteBaseUrl: string;
  canonicalPath: string;
  title: string;
  description: string;
  products: Array<{
    slug: string;
    title: string;
    imageUrl?: string | undefined;
  }>;
};

export function buildComparisonPageJsonLd(
  input: ComparisonJsonLdInput,
): Record<string, unknown> {
  const pageUrl = `${input.siteBaseUrl}${input.canonicalPath}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: input.title,
        description: input.description,
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        name: input.title,
        itemListElement: input.products.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${input.siteBaseUrl}/produtos/${product.slug}`,
          name: product.title,
          ...(product.imageUrl ? { image: product.imageUrl } : {}),
        })),
      },
    ],
  };
}
