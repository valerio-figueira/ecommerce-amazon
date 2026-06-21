import { unstable_cache } from 'next/cache';

import {
  buildDefaultAboutPageContent,
  institutionalPageResponseSchema,
  publicTeamResponseSchema,
  type AboutPageContent,
  type PublicTeamMemberDto,
} from '@ecommerce-amazon/shared/about';
import { PUBLIC_WEB_CACHE_TAGS } from '@ecommerce-amazon/shared/cache';

import { apiFetchParsed } from '@/lib/api/client';
import { getServerBrandConfig } from '@/lib/site-url';

async function loadInstitutionalAboutPage(): Promise<AboutPageContent> {
  const response = await apiFetchParsed(
    '/institutional-pages/sobre',
    institutionalPageResponseSchema,
    {
      next: {
        revalidate: 86400,
        tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('sobre')],
      },
    },
  );
  return response.content;
}

const getCachedInstitutionalAboutPage = unstable_cache(
  loadInstitutionalAboutPage,
  ['institutional-about-sobre'],
  {
    revalidate: 86400,
    tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('sobre')],
  },
);

export async function fetchInstitutionalAboutPage(): Promise<AboutPageContent> {
  const brand = getServerBrandConfig();

  try {
    return await getCachedInstitutionalAboutPage();
  } catch {
    return buildDefaultAboutPageContent(brand);
  }
}

export async function fetchPublicTeamMembers(): Promise<PublicTeamMemberDto[]> {
  try {
    const response = await apiFetchParsed('/team', publicTeamResponseSchema, {
      next: { revalidate: 86400 },
    });
    return response.members;
  } catch {
    return [];
  }
}
