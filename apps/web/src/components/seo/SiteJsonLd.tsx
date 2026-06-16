import { buildSiteJsonLdGraph } from '@ecommerce-amazon/shared/seo';

import { getServerBrandConfig } from '@/lib/site-url';

export function SiteJsonLd(): React.JSX.Element {
  const brand = getServerBrandConfig();
  const jsonLd = buildSiteJsonLdGraph(brand);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
