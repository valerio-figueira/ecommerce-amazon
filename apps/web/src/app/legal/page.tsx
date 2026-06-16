import { buildLegalPageContent, buildLegalPageMetadata } from '@ecommerce-amazon/shared/legal';
import type { Metadata } from 'next';

import { LegalPageContent } from '@/components/legal/LegalPageContent';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  return buildLegalPageMetadata(getServerBrandConfig());
}

export default function LegalPage(): React.JSX.Element {
  const content = buildLegalPageContent(getServerBrandConfig());

  return (
    <main>
      <LegalPageContent content={content} />
    </main>
  );
}
