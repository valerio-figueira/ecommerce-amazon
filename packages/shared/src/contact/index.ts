export {
  buildContactPageContent,
  buildContactPageMetadata,
  buildDefaultContactPageContent,
  buildDefaultContactSocialLinks,
  CONTACT_PAGE_LAST_UPDATED,
  listContactSocialEntries,
  normalizeContactSocialLinks,
  parseContactPageContent,
  resolveContactPageContent,
  type ContactPageContent,
} from './contact-content.js';

export {
  adminContactInstitutionalPageResponseSchema,
  contactInstitutionalPageResponseSchema,
  contactPageContentSchema,
  contactSocialLinksSchema,
  updateContactInstitutionalPageBodySchema,
  type AdminContactInstitutionalPageResponse,
  type ContactInstitutionalPageResponse,
  type ContactSocialLinks,
  type UpdateContactInstitutionalPageBody,
} from './contact-content.schema.js';
