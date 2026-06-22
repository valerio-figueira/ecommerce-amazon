import type { LegalSectionId } from '@ecommerce-amazon/shared/legal';

export const LEGAL_SECTION_LABELS: Record<LegalSectionId, string> = {
  privacidade: 'Política de Privacidade',
  termos: 'Termos de Uso',
  afiliados: 'Divulgação de Afiliados',
  cookies: 'Política de Cookies',
};

export const INSTITUTIONAL_HTML_HINT =
  'Tags permitidas: strong, em, a, ul, ol, li, br, p. Links internos devem começar com /.';

export const SEO_TITLE_LIMIT = 60;
export const SEO_DESCRIPTION_LIMIT = 160;
