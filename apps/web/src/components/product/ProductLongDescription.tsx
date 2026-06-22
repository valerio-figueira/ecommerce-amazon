import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';

import { applyAutoLinksToHtml } from '@/lib/seo/apply-auto-links';

type ProductLongDescriptionProps = {
  html: string;
  autoLinks: AutoLinksResponse['items'];
  productSlug: string;
};

export function ProductLongDescription({
  html,
  autoLinks,
  productSlug,
}: ProductLongDescriptionProps): React.JSX.Element {
  const linkedHtml = applyAutoLinksToHtml(html, autoLinks, 'products', {
    pagePath: `/produtos/${productSlug}`,
  });

  return (
    <section
      className="prose prose-neutral mt-8 max-w-none"
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}
