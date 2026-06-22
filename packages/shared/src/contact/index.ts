export {
  buildContactPageContent,
  buildContactPageMetadata,
  buildDefaultContactPageContent,
  CONTACT_PAGE_LAST_UPDATED,
  parseContactPageContent,
  resolveContactPageContent,
  type ContactPageContent,
} from './contact-content.js';

export {
  adminContactInstitutionalPageResponseSchema,
  contactInstitutionalPageResponseSchema,
  contactPageContentSchema,
  updateContactInstitutionalPageBodySchema,
  type AdminContactInstitutionalPageResponse,
  type ContactInstitutionalPageResponse,
  type UpdateContactInstitutionalPageBody,
} from './contact-content.schema.js';
