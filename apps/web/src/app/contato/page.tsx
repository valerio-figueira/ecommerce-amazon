import type { Metadata } from 'next';

import { ContactPageContentView } from '@/components/contact/ContactPageContent';
import { ContactPageJsonLd } from '@/components/contact/ContactPageJsonLd';
import {
  buildContactPageMetadata,
  buildDefaultContactPageContent,
} from '@ecommerce-amazon/shared/contact';
import {
  fetchInstitutionalContactPage,
  fetchInstitutionalContactPageWithSeo,
} from '@/lib/api/institutional';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const brand = getServerBrandConfig();
  try {
    const { content, seo } = await fetchInstitutionalContactPageWithSeo();
    return buildContactPageMetadata(brand, content, seo);
  } catch {
    return buildContactPageMetadata(brand, buildDefaultContactPageContent(brand));
  }
}

export default async function ContactPage(): Promise<React.JSX.Element> {
  const brand = getServerBrandConfig();
  const content = await fetchInstitutionalContactPage();

  return (
    <main>
      <ContactPageJsonLd />
      <ContactPageContentView content={content} brand={brand} />
    </main>
  );
}
