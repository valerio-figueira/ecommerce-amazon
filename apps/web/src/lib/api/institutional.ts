import { unstable_cache } from 'next/cache';

import {
  buildDefaultAboutPageContent,
  institutionalPageResponseSchema,
  publicTeamResponseSchema,
  type AboutPageContent,
  type PublicTeamMemberDto,
} from '@ecommerce-amazon/shared/about';
import {
  buildDefaultContactPageContent,
  contactInstitutionalPageResponseSchema,
  type ContactPageContent,
} from '@ecommerce-amazon/shared/contact';
import {
  buildDefaultLegalPageContent,
  legalInstitutionalPageResponseSchema,
  type LegalPageContent,
} from '@ecommerce-amazon/shared/legal';
import { PUBLIC_WEB_CACHE_TAGS } from '@ecommerce-amazon/shared/cache';

import { apiFetchParsed } from '@/lib/api/client';
import { getServerBrandConfig } from '@/lib/site-url';

type InstitutionalSeo = {
  seoTitle?: string | null | undefined;
  seoDescription?: string | null | undefined;
};

async function loadInstitutionalAboutPage(): Promise<{
  content: AboutPageContent;
  seo: InstitutionalSeo;
}> {
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
  return {
    content: response.content,
    seo: {
      seoTitle: response.layout.seoTitle ?? null,
      seoDescription: response.layout.seoDescription ?? null,
    },
  };
}

async function loadInstitutionalContactPage(): Promise<{
  content: ContactPageContent;
  seo: InstitutionalSeo;
}> {
  const response = await apiFetchParsed(
    '/institutional-pages/contato',
    contactInstitutionalPageResponseSchema,
    {
      next: {
        revalidate: 86400,
        tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('contato')],
      },
    },
  );
  return {
    content: response.content,
    seo: {
      seoTitle: response.layout.seoTitle ?? null,
      seoDescription: response.layout.seoDescription ?? null,
    },
  };
}

async function loadInstitutionalLegalPage(): Promise<{
  content: LegalPageContent;
  seo: InstitutionalSeo;
}> {
  const response = await apiFetchParsed(
    '/institutional-pages/legal',
    legalInstitutionalPageResponseSchema,
    {
      next: {
        revalidate: 86400,
        tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('legal')],
      },
    },
  );
  return {
    content: response.content,
    seo: {
      seoTitle: response.layout.seoTitle ?? null,
      seoDescription: response.layout.seoDescription ?? null,
    },
  };
}

const getCachedInstitutionalAboutPage = unstable_cache(
  loadInstitutionalAboutPage,
  ['institutional-about-sobre'],
  {
    revalidate: 86400,
    tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('sobre')],
  },
);

const getCachedInstitutionalContactPage = unstable_cache(
  loadInstitutionalContactPage,
  ['institutional-contact-contato'],
  {
    revalidate: 86400,
    tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('contato')],
  },
);

const getCachedInstitutionalLegalPage = unstable_cache(
  loadInstitutionalLegalPage,
  ['institutional-legal-legal'],
  {
    revalidate: 86400,
    tags: [PUBLIC_WEB_CACHE_TAGS.institutionalPage('legal')],
  },
);

async function loadPublicTeamMembers(): Promise<PublicTeamMemberDto[]> {
  const response = await apiFetchParsed('/team', publicTeamResponseSchema, {
    next: {
      revalidate: 86400,
      tags: [PUBLIC_WEB_CACHE_TAGS.publicTeamMembers],
    },
  });
  return response.members;
}

const getCachedPublicTeamMembers = unstable_cache(loadPublicTeamMembers, ['public-team-members'], {
  revalidate: 86400,
  tags: [PUBLIC_WEB_CACHE_TAGS.publicTeamMembers],
});

export async function fetchInstitutionalAboutPage(): Promise<AboutPageContent> {
  const brand = getServerBrandConfig();

  try {
    const result = await getCachedInstitutionalAboutPage();
    return result.content;
  } catch {
    return buildDefaultAboutPageContent(brand);
  }
}

export async function fetchInstitutionalAboutPageWithSeo(): Promise<{
  content: AboutPageContent;
  seo: InstitutionalSeo;
}> {
  const brand = getServerBrandConfig();
  const defaults = buildDefaultAboutPageContent(brand);

  try {
    return await getCachedInstitutionalAboutPage();
  } catch {
    return { content: defaults, seo: {} };
  }
}

export async function fetchInstitutionalContactPage(): Promise<ContactPageContent> {
  const brand = getServerBrandConfig();

  try {
    const result = await getCachedInstitutionalContactPage();
    return result.content;
  } catch {
    return buildDefaultContactPageContent(brand);
  }
}

export async function fetchInstitutionalContactPageWithSeo(): Promise<{
  content: ContactPageContent;
  seo: InstitutionalSeo;
}> {
  const brand = getServerBrandConfig();
  const defaults = buildDefaultContactPageContent(brand);

  try {
    return await getCachedInstitutionalContactPage();
  } catch {
    return { content: defaults, seo: {} };
  }
}

export async function fetchInstitutionalLegalPage(): Promise<LegalPageContent> {
  const brand = getServerBrandConfig();

  try {
    const result = await getCachedInstitutionalLegalPage();
    return result.content;
  } catch {
    return buildDefaultLegalPageContent(brand);
  }
}

export async function fetchInstitutionalLegalPageWithSeo(): Promise<{
  content: LegalPageContent;
  seo: InstitutionalSeo;
}> {
  const brand = getServerBrandConfig();
  const defaults = buildDefaultLegalPageContent(brand);

  try {
    return await getCachedInstitutionalLegalPage();
  } catch {
    return { content: defaults, seo: {} };
  }
}

export async function fetchPublicTeamMembers(): Promise<PublicTeamMemberDto[]> {
  try {
    return await getCachedPublicTeamMembers();
  } catch {
    return [];
  }
}
