import Link from 'next/link';
import { notFound } from 'next/navigation';

import { buildComparisonEphemeralIntro } from '@ecommerce-amazon/shared/comparison';

import { ShareComparisonButton } from '@/components/comparison/ShareComparisonButton';
import { StandaloneComparisonTable } from '@/components/comparison/StandaloneComparisonTable';
import { getProduct } from '@/lib/api/cached-fetchers';
import {
  isValidComparisonSlugCount,
  parseComparisonSlugs,
  productsShareCategory,
  resolveComparisonCategoryLabel,
} from '@/lib/comparison';
import type { ProductDetailDto } from '@/lib/api/schemas';

export const revalidate = 300;

export function generateMetadata(): import('next').Metadata {
  return {
    title: 'Comparar produtos',
    robots: { index: false, follow: true },
  };
}

export default async function CompareEphemeralPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const sp = await searchParams;
  const slugs = parseComparisonSlugs(sp['p']);

  if (!isValidComparisonSlugCount(slugs.length)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-neutral-900">Comparar produtos</h1>
        <p className="mt-3 text-neutral-600">
          Selecione de 2 a 3 produtos da <strong>mesma categoria</strong> nos cards da vitrine e
          use a barra &quot;Comparar&quot; para abrir esta página.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-orange-600 hover:underline">
          Voltar para a vitrine
        </Link>
      </main>
    );
  }

  const products = await Promise.all(slugs.map((slug) => getProduct(slug)));
  const resolved = products.filter((product): product is ProductDetailDto => product !== null);

  if (resolved.length !== slugs.length || !productsShareCategory(resolved)) {
    notFound();
  }

  const intro = buildComparisonEphemeralIntro({
    categoryLabel: resolveComparisonCategoryLabel(resolved),
    products: resolved.map((product) => ({
      title: product.title,
      marketplace: product.marketplace,
      editorialScore: product.editorialScore,
    })),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <header className="mb-8 space-y-3">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Comparativo de produtos</h1>
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">{intro}</p>
          <ShareComparisonButton
            productIds={resolved.map((product) => product.id)}
            products={resolved.map((product) => ({
              title: product.title,
              marketplace: product.marketplace,
              editorialScore: product.editorialScore,
            }))}
            categoryLabel={resolveComparisonCategoryLabel(resolved)}
          />
        </header>

        <section aria-label="Tabela comparativa" className="min-w-0">
          <StandaloneComparisonTable slugs={slugs} products={products} />
        </section>
      </div>
    </main>
  );
}
