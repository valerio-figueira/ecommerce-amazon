import { sanitizeInstitutionalContentRecord } from '../about/sanitize-institutional-html.js';
import type { BrandConfig } from '../config/brand.js';
import { formatWebPageTitle } from '../config/brand.js';
import { isRecord } from '../utils/type-guards.js';

import {
  contactPageContentSchema,
  type ContactPageContent,
  type ContactSocialLinks,
} from './contact-content.schema.js';

const CONTACT_SOCIAL_NETWORKS = ['linkedin', 'instagram', 'x', 'telegram'] as const;

export function buildDefaultContactSocialLinks(brand: BrandConfig): ContactSocialLinks {
  return {
    ...(brand.socials.instagram ? { instagram: brand.socials.instagram } : {}),
    ...(brand.socials.telegram ? { telegram: brand.socials.telegram } : {}),
  };
}

export function normalizeContactSocialLinks(
  raw: ContactSocialLinks | null | undefined,
): ContactSocialLinks {
  const links: ContactSocialLinks = {};

  for (const network of CONTACT_SOCIAL_NETWORKS) {
    const value = raw?.[network]?.trim();
    if (value) {
      links[network] = value;
    }
  }

  return links;
}

function parseSocialLinksFromUnknown(value: unknown): ContactSocialLinks {
  if (!isRecord(value)) {
    return {};
  }

  const candidate: ContactSocialLinks = {};
  for (const network of CONTACT_SOCIAL_NETWORKS) {
    const rawValue = value[network];
    if (typeof rawValue === 'string') {
      candidate[network] = rawValue;
    }
  }

  return normalizeContactSocialLinks(candidate);
}

export function listContactSocialEntries(
  socialLinks: ContactSocialLinks,
): Array<[keyof ContactSocialLinks, string]> {
  const entries: Array<[keyof ContactSocialLinks, string]> = [];

  for (const network of CONTACT_SOCIAL_NETWORKS) {
    const href = socialLinks[network];
    if (href) {
      entries.push([network, href]);
    }
  }

  return entries;
}

export const CONTACT_PAGE_LAST_UPDATED = '2026-06-15';

export type { ContactPageContent } from './contact-content.schema.js';

export function buildDefaultContactPageContent(brand: BrandConfig): ContactPageContent {
  return {
    title: 'Contato',
    intro: `Tem dúvidas sobre nossa curadoria, privacidade ou parcerias? Fale com a equipe do ${brand.name}. Respondemos em prazo razoável, de segunda a sexta.`,
    emailLabel: 'E-mail',
    email: brand.contactEmail,
    socialHeading: 'Redes oficiais',
    socialLinks: buildDefaultContactSocialLinks(brand),
    socialsEnabled: true,
    showOnHome: true,
    legalLinkLabel: 'Políticas de Privacidade e Termos de Uso',
    aboutLinkLabel: 'Sobre nós',
    lastUpdated: CONTACT_PAGE_LAST_UPDATED,
  };
}

/** @deprecated Use buildDefaultContactPageContent */
export const buildContactPageContent = buildDefaultContactPageContent;

export function resolveContactPageContent(stored: unknown, brand: BrandConfig): ContactPageContent {
  const defaults = buildDefaultContactPageContent(brand);
  if (!stored || typeof stored !== 'object') {
    return defaults;
  }

  const parsed = contactPageContentSchema.partial().safeParse(stored);
  if (!parsed.success) {
    return defaults;
  }

  const partial = parsed.data;
  const mergedSocialLinks = normalizeContactSocialLinks({
    ...defaults.socialLinks,
    ...partial.socialLinks,
  });

  return {
    title: partial.title ?? defaults.title,
    intro: partial.intro ?? defaults.intro,
    emailLabel: partial.emailLabel ?? defaults.emailLabel,
    email: partial.email ?? defaults.email,
    socialHeading: partial.socialHeading ?? defaults.socialHeading,
    socialLinks:
      Object.keys(mergedSocialLinks).length > 0 ? mergedSocialLinks : defaults.socialLinks,
    socialsEnabled: partial.socialsEnabled ?? defaults.socialsEnabled,
    showOnHome: partial.showOnHome ?? defaults.showOnHome,
    legalLinkLabel: partial.legalLinkLabel ?? defaults.legalLinkLabel,
    aboutLinkLabel: partial.aboutLinkLabel ?? defaults.aboutLinkLabel,
    lastUpdated: partial.lastUpdated ?? defaults.lastUpdated,
  };
}

export function parseContactPageContent(raw: unknown): ContactPageContent {
  const withNormalizedSocials =
    isRecord(raw) && isRecord(raw['socialLinks'])
      ? {
          ...raw,
          socialLinks: parseSocialLinksFromUnknown(raw['socialLinks']),
        }
      : raw;

  const parsed = contactPageContentSchema.parse(withNormalizedSocials);
  const sanitized = contactPageContentSchema.parse(sanitizeInstitutionalContentRecord(parsed));

  return contactPageContentSchema.parse({
    ...sanitized,
    socialLinks: normalizeContactSocialLinks(sanitized.socialLinks),
  });
}

export function buildContactPageMetadata(
  brand: BrandConfig,
  content?: ContactPageContent,
  seo?: { seoTitle?: string | null | undefined; seoDescription?: string | null | undefined },
): {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: {
    title: string;
    description: string;
    url: string;
  };
} {
  const resolved = content ?? buildDefaultContactPageContent(brand);
  const title = seo?.seoTitle?.trim() ? seo.seoTitle.trim() : formatWebPageTitle('Contato', brand);
  const description = seo?.seoDescription?.trim() ?? resolved.intro.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `${brand.url}/contato` },
    openGraph: {
      title,
      description,
      url: `${brand.url}/contato`,
    },
  };
}
