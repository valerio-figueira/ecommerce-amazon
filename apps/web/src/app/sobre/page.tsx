import {
  buildAboutPageMetadata,
  buildDefaultAboutPageContent,
} from '@ecommerce-amazon/shared/about';
import type { Metadata } from 'next';

import { AboutPageContent } from '@/components/about/AboutPageContent';
import { AboutPageJsonLd } from '@/components/about/AboutPageJsonLd';
import {
  fetchInstitutionalAboutPage,
  fetchPublicTeamMembers,
} from '@/lib/api/institutional';
import { getServerBrandConfig } from '@/lib/site-url';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const brand = getServerBrandConfig();
  try {
    const content = await fetchInstitutionalAboutPage();
    return buildAboutPageMetadata(brand, content);
  } catch {
    return buildAboutPageMetadata(brand, buildDefaultAboutPageContent(brand));
  }
}

export default async function AboutPage(): Promise<React.JSX.Element> {
  const [content, teamMembers] = await Promise.all([
    fetchInstitutionalAboutPage(),
    fetchPublicTeamMembers(),
  ]);

  return (
    <main>
      <AboutPageJsonLd teamMembers={teamMembers} />
      <AboutPageContent content={content} teamMembers={teamMembers} />
    </main>
  );
}
