import {
  buildContactPageContent,
  buildContactPageMetadata,
} from '@ecommerce-amazon/shared/contact';
import type { Metadata } from 'next';

import { ContactPageContentView } from '@/components/contact/ContactPageContent';
import { ContactPageJsonLd } from '@/components/contact/ContactPageJsonLd';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  return buildContactPageMetadata(getServerBrandConfig());
}

export default function ContactPage(): React.JSX.Element {
  const brand = getServerBrandConfig();
  const content = buildContactPageContent(brand);

  return (
    <main>
      <ContactPageJsonLd />
      <ContactPageContentView content={content} brand={brand} />
    </main>
  );
}
