import { parseArticleShortcodes } from '@ecommerce-amazon/shared/content';
import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';

import { ProductDetailEmbed } from '@/components/product/ProductDetailEmbed';
import type { ProductDetailDto } from '@/lib/api/schemas';
import { applyAutoLinksToHtml } from '@/lib/seo/apply-auto-links';

type ProductLongDescriptionProps = {
  html: string;
  autoLinks: AutoLinksResponse['items'];
  productSlug: string;
  embeddedProducts?: Record<string, ProductDetailDto | null> | undefined;
};

export function ProductLongDescription({
  html,
  autoLinks,
  productSlug,
  embeddedProducts = {},
}: ProductLongDescriptionProps): React.JSX.Element {
  const linkedHtml = applyAutoLinksToHtml(html, autoLinks, 'products', {
    pagePath: `/produtos/${productSlug}`,
  });
  const segments = parseArticleShortcodes(linkedHtml);
  const hasEmbeds = segments.some((segment) => segment.type === 'product');

  if (!hasEmbeds) {
    return (
      <section
        className="prose prose-neutral mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: linkedHtml }}
      />
    );
  }

  return (
    <section className="prose prose-neutral mt-8 max-w-none">
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          if (segment.html.trim() === '') return null;
          return <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: segment.html }} />;
        }

        if (segment.type === 'compare') {
          return null;
        }

        const product = embeddedProducts[segment.slug] ?? null;
        return (
          <aside
            key={`product-${segment.slug}-${index}`}
            className="not-prose my-6 min-w-0 w-full sm:my-8"
            aria-label="Produto relacionado"
          >
            <ProductDetailEmbed slug={segment.slug} product={product} />
          </aside>
        );
      })}
    </section>
  );
}
