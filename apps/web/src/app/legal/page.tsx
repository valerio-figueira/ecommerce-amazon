import {
  buildDefaultLegalPageContent,
  buildLegalPageMetadata,
} from '@ecommerce-amazon/shared/legal';
import type { Metadata } from 'next';

import { LegalPageContent } from '@/components/legal/LegalPageContent';
import {
  fetchInstitutionalLegalPage,
  fetchInstitutionalLegalPageWithSeo,
} from '@/lib/api/institutional';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const brand = getServerBrandConfig();
  try {
    const { content, seo } = await fetchInstitutionalLegalPageWithSeo();
    return buildLegalPageMetadata(brand, content, seo);
  } catch {
    return buildLegalPageMetadata(brand, buildDefaultLegalPageContent(brand));
  }
}

export default async function LegalPage(): Promise<React.JSX.Element> {
  const content = await fetchInstitutionalLegalPage();

  return (
    <main>
      <LegalPageContent content={content} />
    </main>
  );
}
