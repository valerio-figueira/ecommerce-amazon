import type { AboutSectionId } from '@ecommerce-amazon/shared/about';

export const ABOUT_SECTION_LABELS: Record<AboutSectionId, string> = {
  proposta: 'Por que existimos',
  metodo: 'Como selecionamos produtos',
  afiliados: 'Transparência de afiliados',
  equipe: 'Quem somos',
};

export const INSTITUTIONAL_HTML_HINT =
  'Tags permitidas: strong, em, a, ul, ol, li, br, p. Links internos devem começar com /.';

export const SEO_TITLE_LIMIT = 60;
export const SEO_DESCRIPTION_LIMIT = 160;
