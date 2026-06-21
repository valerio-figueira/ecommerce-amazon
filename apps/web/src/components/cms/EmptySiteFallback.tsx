import Link from 'next/link';

import { SiteJsonLd } from '@/components/seo/SiteJsonLd';
import { getServerBrandConfig } from '@/lib/site-url';
import { cn } from '@/lib/utils';

const primaryLinkClassName = cn(
  'mt-8 inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-colors hover:opacity-90',
);

type EmptySiteFallbackProps = {
  /** Optional override for the preparing message. */
  message?: string;
};

/** Public fallback when CMS/API content is not available yet — no dev/ops messaging. */
export function EmptySiteFallback({
  message = 'Estamos organizando nossa vitrine. Em breve você verá ofertas selecionadas com histórico de preços e alertas.',
}: EmptySiteFallbackProps): React.JSX.Element {
  const brand = getServerBrandConfig();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-center">
      <SiteJsonLd />
      <h1 className="text-2xl font-bold">{brand.name}</h1>
      <p className="mt-2 text-neutral-600">{brand.tagline}</p>
      <p className="mx-auto mt-4 max-w-lg text-neutral-500">{message}</p>
      <Link href="/sobre" className={primaryLinkClassName}>
        Conheça a vitrine
      </Link>
    </main>
  );
}
