import type { BrandConfig } from '../config/brand.js';
import { formatEditorialTeamName, formatWebPageTitle } from '../config/brand.js';

import {
  aboutPageContentSchema,
  type AboutPageContent,
  type AboutSection,
} from './about-content.schema.js';
import { sanitizeInstitutionalContentRecord } from './sanitize-institutional-html.js';

export const ABOUT_PAGE_LAST_UPDATED = '2026-06-15';

function buildDefaultSections(brand: BrandConfig): AboutSection[] {
  return [
    {
      id: 'proposta',
      title: 'Por que existimos',
      paragraphs: [
        `Ajudamos você a encontrar os melhores produtos da internet, sem complicação e sem perder dinheiro. O ${brand.name} nasceu porque escolher entre milhares de ofertas na Amazon e na Shopee consome tempo — e um erro de compra custa caro.`,
        `Nossa missão é simples: ${brand.tagline.toLowerCase()}. Você não precisa virar especialista em ficha técnica; precisa de alguém que já fez esse trabalho por você.`,
      ],
      listItems: [
        'Curadoria humana — não somos um robô que espelha links sem critério.',
        'Histórico de preços local para você saber se a oferta vale a pena hoje.',
        'Conteúdo editorial que explica o porquê de cada recomendação.',
      ],
    },
    {
      id: 'metodo',
      title: 'Como selecionamos produtos',
      paragraphs: [
        `Cada produto na vitrine passa por um processo de curadoria antes de aparecer para você. Combinamos dados locais (preço, avaliações, histórico) com revisão editorial da ${formatEditorialTeamName(brand)}.`,
      ],
      listItems: [
        'Análise de fichas técnicas e avaliações verificadas (priorizamos produtos bem avaliados).',
        'Monitoramento contínuo de preços na Amazon BR e Shopee BR — ofertas desatualizadas são sinalizadas.',
        'Seleção editorial: priorizamos utilidade real, custo-benefício e relevância para o nicho.',
        'Produtos com histórico insuficiente ou preço stale (>24h) não exibem urgência fictícia.',
      ],
    },
    {
      id: 'afiliados',
      title: 'Transparência de afiliados',
      paragraphs: [
        `Transparência em primeiro lugar: quando você clica em um link do ${brand.name} e compra um produto, podemos receber uma pequena comissão da loja parceira (Amazon ou Shopee). Você não paga nada a mais por isso, e é essa comissão que mantém nossa plataforma gratuita, rápida e livre de anúncios pop-up irritantes.`,
      ],
      callout: true,
    },
    {
      id: 'equipe',
      title: 'Quem somos',
      paragraphs: [
        `Por trás do ${brand.name} há pessoas reais — curadores, redatores e especialistas que testam, comparam e escrevem sobre produtos todos os dias. Conheça quem faz a curadoria:`,
      ],
    },
  ];
}

export function buildDefaultAboutPageContent(brand: BrandConfig): AboutPageContent {
  return {
    heroTitle: `Encontre o produto certo, sem perder tempo nem dinheiro`,
    heroIntro: `${brand.name} — ${brand.tagline}. Curadoria independente de ofertas na Amazon e Shopee, com histórico de preços e conteúdo editorial para você decidir com confiança.`,
    sections: buildDefaultSections(brand),
    teamSectionIntro: `Somos a ${formatEditorialTeamName(brand)} — um time de curadores que analisa produtos, escreve guias e mantém a vitrine atualizada para você.`,
    trafficDirection: {
      title: 'Continue explorando',
      intro:
        'Agora que você conhece quem está por trás do site, veja onde podemos ajudar na sua próxima compra:',
      links: [
        {
          label: 'Ver nossos guias de compra',
          href: '/artigos',
          description: 'Artigos editoriais com comparativos e recomendações',
        },
      ],
    },
    lastUpdated: ABOUT_PAGE_LAST_UPDATED,
  };
}

function mergeSections(
  defaults: AboutSection[],
  stored: AboutSection[] | undefined,
): AboutSection[] {
  if (!stored) return defaults;

  return defaults.map((defaultSection) => {
    const override = stored.find((section) => section.id === defaultSection.id);
    if (!override) return defaultSection;
    return {
      ...defaultSection,
      ...override,
      id: defaultSection.id,
    };
  });
}

export function resolveAboutPageContent(stored: unknown, brand: BrandConfig): AboutPageContent {
  const defaults = buildDefaultAboutPageContent(brand);
  if (!stored || typeof stored !== 'object') {
    return defaults;
  }

  const parsed = aboutPageContentSchema.partial().safeParse(stored);
  if (!parsed.success) {
    return defaults;
  }

  const partial = parsed.data;
  return {
    heroTitle: partial.heroTitle ?? defaults.heroTitle,
    heroIntro: partial.heroIntro ?? defaults.heroIntro,
    sections: mergeSections(defaults.sections, partial.sections),
    teamSectionIntro: partial.teamSectionIntro ?? defaults.teamSectionIntro,
    trafficDirection: partial.trafficDirection ?? defaults.trafficDirection,
    lastUpdated: partial.lastUpdated ?? defaults.lastUpdated,
  };
}

export function parseAboutPageContent(raw: unknown): AboutPageContent {
  const parsed = aboutPageContentSchema.parse(raw);
  return aboutPageContentSchema.parse(sanitizeInstitutionalContentRecord(parsed));
}

export function buildAboutPageMetadata(
  brand: BrandConfig,
  content?: AboutPageContent,
  seo?: { seoTitle?: string | null; seoDescription?: string | null },
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
  const resolved = content ?? buildDefaultAboutPageContent(brand);
  const title = seo?.seoTitle?.trim() ? seo.seoTitle.trim() : formatWebPageTitle('Sobre', brand);
  const description = seo?.seoDescription?.trim() ?? resolved.heroIntro.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `${brand.url}/sobre` },
    openGraph: {
      title,
      description,
      url: `${brand.url}/sobre`,
    },
  };
}
