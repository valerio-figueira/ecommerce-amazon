import {
  buildDefaultAboutPageContent,
  institutionalPageResponseSchema,
  publicTeamResponseSchema,
  type AboutPageContent,
  type PublicTeamMemberDto,
} from '@ecommerce-amazon/shared/about';

import { apiFetchParsed } from '@/lib/api/client';
import { getServerBrandConfig } from '@/lib/site-url';

export async function fetchInstitutionalAboutPage(): Promise<AboutPageContent> {
  const brand = getServerBrandConfig();

  try {
    const response = await apiFetchParsed(
      '/institutional-pages/sobre',
      institutionalPageResponseSchema,
      { next: { revalidate: 86400 } },
    );
    return response.content;
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
