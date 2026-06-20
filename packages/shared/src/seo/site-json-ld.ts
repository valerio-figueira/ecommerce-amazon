import type { BrandConfig } from '../config/brand.js';

export type CategoryProductItemListInput = {
  siteBaseUrl: string;
  categoryLabel: string;
  products: Array<{ slug: string; title: string }>;
};

export type ArticleJsonLdAuthor = {
  name: string;
  avatarUrl?: string | null;
};

export type ArticleJsonLdClusterMember = {
  slug: string;
  title: string;
  isPilar: boolean;
};

export type ArticleJsonLdCluster = {
  name: string;
  role: string;
  members: ArticleJsonLdClusterMember[];
};

export type ArticleJsonLdInput = {
  siteBaseUrl: string;
  brand: BrandConfig;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  coverImageUrl?: string | null;
  author?: ArticleJsonLdAuthor | null;
  categoryName?: string | null;
  cluster?: ArticleJsonLdCluster | null;
};

export function buildOrganizationJsonLd(brand: BrandConfig): Record<string, unknown> {
  const sameAs = [brand.socials.instagram, brand.socials.telegram].filter((url) => url.length > 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    legalName: brand.legalName,
    url: brand.url,
    contactPoint: {
      '@type': 'ContactPoint',
      email: brand.contactEmail,
      contactType: 'customer support',
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteJsonLd(brand: BrandConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brand.name,
    url: brand.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${brand.url}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildSiteJsonLdGraph(brand: BrandConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationJsonLd(brand), buildWebSiteJsonLd(brand)],
  };
}

export type AboutPageJsonLdTeamMember = {
  name: string;
  jobTitle?: string | null;
  avatarUrl?: string | null;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    x?: string;
    telegram?: string;
  } | null;
  publicTeamRole: 'founder' | 'member';
};

function collectPersonSameAs(socialLinks: AboutPageJsonLdTeamMember['socialLinks']): string[] {
  if (!socialLinks) return [];
  return [socialLinks.linkedin, socialLinks.instagram, socialLinks.x, socialLinks.telegram].filter(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );
}

export function buildAboutPageJsonLd(
  brand: BrandConfig,
  teamMembers: AboutPageJsonLdTeamMember[] = [],
): Record<string, unknown> {
  const orgId = `${brand.url}/#organization`;
  const pageId = `${brand.url}/sobre#webpage`;
  const founders: Array<{ '@id': string }> = [];
  const employees: Array<{ '@id': string }> = [];
  const personNodes: Record<string, unknown>[] = [];

  teamMembers.forEach((member, index) => {
    const personId = `${brand.url}/sobre#person-${index}`;
    const sameAs = collectPersonSameAs(member.socialLinks);
    const personNode: Record<string, unknown> = {
      '@type': 'Person',
      '@id': personId,
      name: member.name,
      worksFor: { '@id': orgId },
      ...(member.jobTitle ? { jobTitle: member.jobTitle } : {}),
      ...(member.avatarUrl ? { image: member.avatarUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };
    personNodes.push(personNode);

    if (member.publicTeamRole === 'founder') {
      founders.push({ '@id': personId });
    } else {
      employees.push({ '@id': personId });
    }
  });

  const organizationNode: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: brand.name,
    legalName: brand.legalName,
    url: brand.url,
    contactPoint: {
      '@type': 'ContactPoint',
      email: brand.contactEmail,
      contactType: 'customer support',
    },
    ...(founders.length > 0 ? { founder: founders } : {}),
    ...(employees.length > 0 ? { employee: employees } : {}),
  };

  const brandSameAs = [brand.socials.instagram, brand.socials.telegram].filter(
    (url) => url.length > 0,
  );
  if (brandSameAs.length > 0) {
    organizationNode['sameAs'] = brandSameAs;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': pageId,
        url: `${brand.url}/sobre`,
        name: `Sobre ${brand.name}`,
        mainEntity: { '@id': orgId },
      },
      organizationNode,
      ...personNodes,
    ],
  };
}

export function buildContactPageJsonLd(brand: BrandConfig): Record<string, unknown> {
  const orgId = `${brand.url}/#organization`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${brand.url}/contato#webpage`,
        url: `${brand.url}/contato`,
        name: `Contato — ${brand.name}`,
        mainEntity: { '@id': orgId },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: brand.name,
        url: brand.url,
        contactPoint: {
          '@type': 'ContactPoint',
          email: brand.contactEmail,
          contactType: 'customer support',
        },
      },
    ],
  };
}

export function buildCategoryProductItemListJsonLd(
  input: CategoryProductItemListInput,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.categoryLabel,
    itemListElement: input.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.title,
      url: `${input.siteBaseUrl}/produtos/${product.slug}`,
    })),
  };
}

export function buildArticleJsonLd(input: ArticleJsonLdInput): Record<string, unknown> {
  const pageUrl = `${input.siteBaseUrl}/artigos/${input.slug}`;
  const authorName = input.author?.name ?? input.brand.name;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      headline: input.title,
      description: input.excerpt,
      url: pageUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
      ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
      publisher: {
        '@type': 'Organization',
        name: input.brand.name,
        url: input.brand.url,
      },
      author: input.author
        ? {
            '@type': 'Person',
            name: authorName,
            ...(input.author.avatarUrl ? { image: input.author.avatarUrl } : {}),
          }
        : { '@type': 'Organization', name: input.brand.name },
      ...(input.categoryName ? { articleSection: input.categoryName } : {}),
      ...(input.coverImageUrl ? { image: [input.coverImageUrl] } : {}),
    },
  ];

  if (input.cluster?.role === 'pilar') {
    const spokes = input.cluster.members.filter((member) => !member.isPilar);
    if (spokes.length > 0) {
      graph.push({
        '@type': 'ItemList',
        name: input.cluster.name,
        itemListElement: spokes.map((member, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: member.title,
          url: `${input.siteBaseUrl}/artigos/${member.slug}`,
        })),
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
