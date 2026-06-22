export {
  LEGAL_PAGE_LAST_UPDATED,
  SESSION_COOKIE_NAME,
  buildDefaultLegalPageContent,
  buildLegalPageContent,
  buildLegalPageMetadata,
  parseLegalPageContent,
  resolveLegalPageContent,
  type LegalPageContent,
  type LegalSection,
  type LegalSubsection,
} from './legal-content.js';

export {
  LEGAL_SECTION_IDS,
  adminLegalInstitutionalPageResponseSchema,
  legalInstitutionalPageResponseSchema,
  legalPageContentSchema,
  legalSectionSchema,
  legalSubsectionSchema,
  updateLegalInstitutionalPageBodySchema,
  type AdminLegalInstitutionalPageResponse,
  type LegalInstitutionalPageResponse,
  type LegalSectionId,
  type UpdateLegalInstitutionalPageBody,
} from './legal-content.schema.js';
export { CONSENT_COOKIE_NAME, CONSENT_VALUE } from './cookie-consent.js';
