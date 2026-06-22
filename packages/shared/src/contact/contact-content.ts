import { sanitizeInstitutionalContentRecord } from '../about/sanitize-institutional-html.js';
import type { BrandConfig } from '../config/brand.js';
import { formatWebPageTitle } from '../config/brand.js';

import { contactPageContentSchema, type ContactPageContent } from './contact-content.schema.js';

export const CONTACT_PAGE_LAST_UPDATED = '2026-06-15';

export type { ContactPageContent } from './contact-content.schema.js';

export function buildDefaultContactPageContent(brand: BrandConfig): ContactPageContent {
  return {
    title: 'Contato',
    intro: `Tem dúvidas sobre nossa curadoria, privacidade ou parcerias? Fale com a equipe do ${brand.name}. Respondemos em prazo razoável, de segunda a sexta.`,
    emailLabel: 'E-mail',
    email: brand.contactEmail,
    socialHeading: 'Redes oficiais',
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
  return {
    title: partial.title ?? defaults.title,
    intro: partial.intro ?? defaults.intro,
    emailLabel: partial.emailLabel ?? defaults.emailLabel,
    email: partial.email ?? defaults.email,
    socialHeading: partial.socialHeading ?? defaults.socialHeading,
    legalLinkLabel: partial.legalLinkLabel ?? defaults.legalLinkLabel,
    aboutLinkLabel: partial.aboutLinkLabel ?? defaults.aboutLinkLabel,
    lastUpdated: partial.lastUpdated ?? defaults.lastUpdated,
  };
}

export function parseContactPageContent(raw: unknown): ContactPageContent {
  const parsed = contactPageContentSchema.parse(raw);
  return contactPageContentSchema.parse(sanitizeInstitutionalContentRecord(parsed));
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
