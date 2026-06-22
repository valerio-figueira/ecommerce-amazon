import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';

import { applyAutoLinksToHtml } from '@/lib/seo/apply-auto-links';

type ProductLongDescriptionProps = {
  html: string;
  autoLinks: AutoLinksResponse['items'];
};

export function ProductLongDescription({
  html,
  autoLinks,
}: ProductLongDescriptionProps): React.JSX.Element {
  const linkedHtml = applyAutoLinksToHtml(html, autoLinks);

  return (
    <section
      className="prose prose-neutral mt-8 max-w-none"
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}
