import Link from 'next/link';

import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { getServerBrandConfig } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const primaryLinkClassName = cn(
  'mt-8 inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-colors hover:opacity-90',
);

/** Fallback publico quando o layout CMS da home ainda nao esta disponivel — sem mensagens de dev/ops. */
export function HomePreparingFallback(): React.JSX.Element {
  const brand = getServerBrandConfig();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <SiteJsonLd />
      <h1 className="text-2xl font-bold">{brand.name}</h1>
      <p className="mt-2 text-neutral-600">{brand.tagline}</p>
      <p className="mx-auto mt-4 max-w-lg text-neutral-500">
        Estamos organizando nossa vitrine. Em breve você verá ofertas selecionadas com histórico de
        preços e alertas.
      </p>
      <Link href="/sobre" className={primaryLinkClassName}>
        Conheça a vitrine
      </Link>
    </main>
  );
}
