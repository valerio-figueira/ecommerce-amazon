import type { AboutPageContent } from '../about/about-content.schema.js';
import {
  adminInstitutionalPageResponseSchema,
  institutionalPageResponseSchema,
  updateInstitutionalPageBodySchema,
} from '../about/about-content.schema.js';
import { parseAboutPageContent, resolveAboutPageContent } from '../about/about-content.js';
import type { BrandConfig } from '../config/brand.js';
import type { ContactPageContent } from '../contact/contact-content.schema.js';
import {
  adminContactInstitutionalPageResponseSchema,
  contactInstitutionalPageResponseSchema,
  updateContactInstitutionalPageBodySchema,
} from '../contact/contact-content.schema.js';
import { parseContactPageContent, resolveContactPageContent } from '../contact/contact-content.js';
import type { LegalPageContent } from '../legal/legal-content.schema.js';
import {
  adminLegalInstitutionalPageResponseSchema,
  legalInstitutionalPageResponseSchema,
  updateLegalInstitutionalPageBodySchema,
} from '../legal/legal-content.schema.js';
import { parseLegalPageContent, resolveLegalPageContent } from '../legal/legal-content.js';

export const INSTITUTIONAL_PAGE_SLUGS = ['sobre', 'contato', 'legal'] as const;

export type InstitutionalPageSlug = (typeof INSTITUTIONAL_PAGE_SLUGS)[number];

export type InstitutionalPageContent = AboutPageContent | ContactPageContent | LegalPageContent;

export function isInstitutionalPageSlug(slug: string): slug is InstitutionalPageSlug {
  return slug === 'sobre' || slug === 'contato' || slug === 'legal';
}

export function resolveInstitutionalPageContent(
  slug: InstitutionalPageSlug,
  stored: unknown,
  brand: BrandConfig,
): InstitutionalPageContent {
  switch (slug) {
    case 'sobre':
      return resolveAboutPageContent(stored, brand);
    case 'contato':
      return resolveContactPageContent(stored, brand);
    case 'legal':
      return resolveLegalPageContent(stored, brand);
  }
}

export function parseInstitutionalPageContent(
  slug: InstitutionalPageSlug,
  raw: unknown,
): InstitutionalPageContent {
  switch (slug) {
    case 'sobre':
      return parseAboutPageContent(raw);
    case 'contato':
      return parseContactPageContent(raw);
    case 'legal':
      return parseLegalPageContent(raw);
  }
}

export function parseUpdateInstitutionalPageBody(
  slug: 'sobre',
  raw: unknown,
): ReturnType<typeof updateInstitutionalPageBodySchema.parse>;
export function parseUpdateInstitutionalPageBody(
  slug: 'contato',
  raw: unknown,
): ReturnType<typeof updateContactInstitutionalPageBodySchema.parse>;
export function parseUpdateInstitutionalPageBody(
  slug: 'legal',
  raw: unknown,
): ReturnType<typeof updateLegalInstitutionalPageBodySchema.parse>;
export function parseUpdateInstitutionalPageBody(slug: InstitutionalPageSlug, raw: unknown) {
  switch (slug) {
    case 'sobre':
      return updateInstitutionalPageBodySchema.parse(raw);
    case 'contato':
      return updateContactInstitutionalPageBodySchema.parse(raw);
    case 'legal':
      return updateLegalInstitutionalPageBodySchema.parse(raw);
  }
}

export function parseInstitutionalPageResponse(slug: InstitutionalPageSlug, raw: unknown) {
  switch (slug) {
    case 'sobre':
      return institutionalPageResponseSchema.parse(raw);
    case 'contato':
      return contactInstitutionalPageResponseSchema.parse(raw);
    case 'legal':
      return legalInstitutionalPageResponseSchema.parse(raw);
  }
}

export function parseAdminInstitutionalPageResponse(slug: InstitutionalPageSlug, raw: unknown) {
  switch (slug) {
    case 'sobre':
      return adminInstitutionalPageResponseSchema.parse(raw);
    case 'contato':
      return adminContactInstitutionalPageResponseSchema.parse(raw);
    case 'legal':
      return adminLegalInstitutionalPageResponseSchema.parse(raw);
  }
}
