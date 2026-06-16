import { buildContactPageJsonLd } from '@ecommerce-amazon/shared/seo';

import { getServerBrandConfig } from '@/lib/site-url';

export function ContactPageJsonLd(): React.JSX.Element {
  const brand = getServerBrandConfig();
  const jsonLd = buildContactPageJsonLd(brand);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
