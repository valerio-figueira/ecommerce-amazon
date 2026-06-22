import { sanitizeInstitutionalContentRecord } from '../about/sanitize-institutional-html.js';
import type { BrandConfig } from '../config/brand.js';
import { formatWebPageTitle } from '../config/brand.js';

import {
  legalPageContentSchema,
  type LegalPageContent,
  type LegalSection,
} from './legal-content.schema.js';

export const LEGAL_PAGE_LAST_UPDATED = '2026-06-15';

export const SESSION_COOKIE_NAME = 'vitrine_session';

export type { LegalPageContent, LegalSection, LegalSubsection } from './legal-content.schema.js';

function mergeLegalSections(
  defaults: LegalSection[],
  stored: LegalSection[] | undefined,
): LegalSection[] {
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

export function buildDefaultLegalPageContent(brand: BrandConfig): LegalPageContent {
  return {
    title: 'Políticas de Privacidade e Termos de Uso',
    lastUpdated: LEGAL_PAGE_LAST_UPDATED,
    intro: `Este documento reúne as políticas que regem o uso de ${brand.name} (${brand.url}), operado por ${brand.legalName}. Leia com atenção antes de navegar, salvar produtos na lista de desejos ou interagir com links comerciais.`,
    sections: [
      buildPrivacySection(brand),
      buildTermsSection(brand),
      buildAffiliateSection(brand),
      buildCookiesSection(brand),
    ],
  };
}

/** @deprecated Use buildDefaultLegalPageContent */
export const buildLegalPageContent = buildDefaultLegalPageContent;

export function resolveLegalPageContent(stored: unknown, brand: BrandConfig): LegalPageContent {
  const defaults = buildDefaultLegalPageContent(brand);
  if (!stored || typeof stored !== 'object') {
    return defaults;
  }

  const parsed = legalPageContentSchema.partial().safeParse(stored);
  if (!parsed.success) {
    return defaults;
  }

  const partial = parsed.data;
  return {
    title: partial.title ?? defaults.title,
    lastUpdated: partial.lastUpdated ?? defaults.lastUpdated,
    intro: partial.intro ?? defaults.intro,
    sections: mergeLegalSections(defaults.sections, partial.sections),
  };
}

export function parseLegalPageContent(raw: unknown): LegalPageContent {
  const parsed = legalPageContentSchema.parse(raw);
  return legalPageContentSchema.parse(sanitizeInstitutionalContentRecord(parsed));
}

function buildPrivacySection(brand: BrandConfig): LegalSection {
  return {
    id: 'privacidade',
    title: 'Política de Privacidade',
    paragraphs: [
      `${brand.legalName} ("nós", "nosso" ou "controlador") trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Esta política descreve quais dados coletamos, para quê usamos e quais são os seus direitos.`,
      `Para exercer direitos ou tirar dúvidas sobre privacidade, escreva para ${brand.contactEmail}. Responderemos em prazo razoável, conforme a LGPD.`,
    ],
    subsections: [
      {
        title: 'Dados que podemos coletar',
        paragraphs: [
          'Coletamos apenas o necessário para operar a vitrine, medir desempenho editorial e, quando você optar, enviar comunicações relacionadas a alertas de preço.',
        ],
        listItems: [
          'Identificador de sessão anônimo (cookie técnico) para manter sua lista de desejos no navegador.',
          'Dados de navegação agregados: páginas visitadas, origem do clique (listagem, detalhe, embed, comparador), produto visualizado e horário aproximado — sem cadastro obrigatório.',
          'Endereço de e-mail e preferências de alerta de preço, somente quando você solicitar e confirmar o cadastro (double opt-in).',
          'Dados técnicos padrão de acesso (tipo de navegador, endereço IP, referrer) registrados em logs de servidor para segurança e diagnóstico.',
        ],
      },
      {
        title: 'Finalidades e bases legais',
        paragraphs: ['Utilizamos os dados para as finalidades abaixo:'],
        listItems: [
          'Operar funcionalidades essenciais do site, como wishlist anônima — base legal: execução de contrato ou legítimo interesse (art. 7º, V e IX, LGPD).',
          'Medir cliques em links comerciais e engajamento em artigos editoriais — base legal: legítimo interesse, com dados minimizados e sem perfil invasivo.',
          'Enviar alertas de preço por e-mail — base legal: consentimento explícito (art. 7º, I, LGPD), revogável a qualquer momento.',
          'Cumprir obrigações legais e responder a solicitações de autoridades, quando aplicável.',
        ],
      },
      {
        title: 'Compartilhamento',
        paragraphs: [
          'Não vendemos dados pessoais. Ao clicar em "Ver preço na Amazon" ou "Ver preço na Shopee", você é redirecionado ao marketplace parceiro, que possui política de privacidade própria. Links comerciais usam identificadores de afiliado exigidos pelos programas; não enviamos seu e-mail ou nome a esses parceiros por meio dos redirecionamentos.',
          'Podemos usar provedores de infraestrutura (hospedagem, e-mail transacional) como operadores, sob contratos que exigem proteção adequada dos dados.',
        ],
      },
      {
        title: 'Retenção e segurança',
        paragraphs: [
          'Mantemos dados pelo tempo necessário à finalidade ou exigência legal. Alertas de preço inativos ou cancelados são excluídos ou anonimizados conforme rotinas operacionais. Aplicamos medidas técnicas e organizacionais razoáveis para proteger informações contra acesso não autorizado.',
        ],
      },
      {
        title: 'Seus direitos (LGPD)',
        paragraphs: ['Você pode solicitar, conforme aplicável:'],
        listItems: [
          'Confirmação da existência de tratamento e acesso aos dados.',
          'Correção de dados incompletos ou desatualizados.',
          'Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.',
          'Portabilidade e informação sobre compartilhamentos.',
          'Revogação do consentimento (alertas de e-mail) e oposição a tratamentos baseados em legítimo interesse, quando cabível.',
        ],
      },
      {
        title: 'Menores de idade',
        paragraphs: [
          `${brand.name} não se destina a menores de 18 anos. Não coletamos intencionalmente dados de crianças. Se identificarmos coleta inadvertida, excluiremos os dados.`,
        ],
      },
    ],
  };
}

function buildTermsSection(brand: BrandConfig): LegalSection {
  return {
    id: 'termos',
    title: 'Termos de Uso',
    paragraphs: [
      `Ao acessar ${brand.url}, você concorda com estes Termos de Uso. Se não concordar, interrompa o uso do site.`,
    ],
    subsections: [
      {
        title: 'Natureza do serviço',
        paragraphs: [
          `${brand.name} é uma vitrine de curadoria editorial e comparação de ofertas. Não somos loja, não processamos pagamentos, não realizamos entregas nem atendemos pós-venda de produtos listados. Toda compra ocorre nos marketplaces parceiros (Amazon Brasil, Shopee Brasil ou outros indicados na página).`,
        ],
      },
      {
        title: 'Conteúdo e preços',
        paragraphs: [
          'Textos, reviews, comparativos e recomendações são produzidos ou curados pela nossa equipe editorial e podem conter opinião. Preços, disponibilidade, frete e condições de pagamento exibidos derivam de dados sincronizados periodicamente e podem divergir do marketplace no momento da compra.',
          'Quando um preço estiver desatualizado (sem atualização há mais de 24 horas), o valor numérico pode ser ocultado; o botão de redirecionamento permanece disponível para consulta direta na loja parceira.',
        ],
      },
      {
        title: 'Uso permitido',
        paragraphs: ['Você concorda em não:'],
        listItems: [
          'Utilizar o site para fins ilícitos, automatizar acesso abusivo (scraping massivo) ou tentar comprometer a infraestrutura.',
          'Reproduzir conteúdo editorial em massa sem autorização prévia.',
          'Manipular links de afiliado ou contornar mecanismos de medição de cliques.',
        ],
      },
      {
        title: 'Propriedade intelectual',
        paragraphs: [
          `Marcas, logotipos, layout e conteúdo editorial de ${brand.name} são protegidos por direitos autorais e leis correlatas. Imagens e descrições de produtos podem ser de titularidade dos marketplaces ou fabricantes e são exibidas para fins informativos.`,
        ],
      },
      {
        title: 'Limitação de responsabilidade',
        paragraphs: [
          'O site é fornecido "como está". Na extensão permitida pela lei, não nos responsabilizamos por decisões de compra, indisponibilidade de produtos, alterações de preço nos parceiros ou danos indiretos decorrentes do uso das informações publicadas.',
        ],
      },
      {
        title: 'Alterações',
        paragraphs: [
          'Podemos atualizar estes Termos e a Política de Privacidade. A data da última revisão consta no topo desta página. O uso continuado após alterações implica aceitação das novas condições.',
        ],
      },
    ],
  };
}

function buildAffiliateSection(brand: BrandConfig): LegalSection {
  return {
    id: 'afiliados',
    title: 'Divulgação de Afiliados',
    paragraphs: [
      `${brand.name} participa de programas de afiliados, incluindo Amazon Associados e Shopee Afiliados (e programas equivalentes quando indicados). Isso significa que podemos receber comissão quando você acessa um produto por nossos links e realiza uma compra qualificada no marketplace parceiro, sem custo adicional para você.`,
      'Nossa curadoria é independente: recomendações editoriais não são determinadas exclusivamente por comissão. Sempre indicamos claramente o destino comercial com CTAs do tipo "Ver preço na Amazon" ou "Ver preço na Shopee".',
      'Links comerciais são marcados com atributos rel="noopener sponsored" e passam por redirecionamento interno (/go/) para registro estatístico antes de abrir o parceiro em nova aba, quando aplicável.',
      'Preços exibidos na vitrine são informativos e podem mudar a qualquer momento no site do parceiro. Cupons e promoções só são destacados quando verificados conforme nossos critérios editoriais.',
      `Dúvidas sobre esta divulgação: ${brand.contactEmail}.`,
    ],
  };
}

function buildCookiesSection(_brand: BrandConfig): LegalSection {
  return {
    id: 'cookies',
    title: 'Política de Cookies',
    paragraphs: [
      'Cookies são pequenos arquivos armazenados no seu navegador. Utilizamos cookies estritamente necessários e, futuramente, cookies analíticos somente com mecanismo de consentimento adequado (Consent Mode), conforme evolução da plataforma.',
    ],
    subsections: [
      {
        title: 'Cookies que utilizamos hoje',
        listItems: [
          `${SESSION_COOKIE_NAME} — identificador de sessão anônimo para wishlist e correlação de cliques. Duração: até 12 meses. Categoria: necessário/funcional. Base: legítimo interesse e execução do serviço solicitado por você.`,
        ],
        paragraphs: [],
      },
      {
        title: 'Cookies analíticos (futuro)',
        paragraphs: [
          'Planejamos integrar ferramentas como Google Analytics 4 para entender tráfego agregado. Quando ativadas, essas tecnologias só serão carregadas após consentimento explícito via banner de cookies, em conformidade com a LGPD.',
        ],
      },
      {
        title: 'Como gerenciar',
        paragraphs: [
          'Você pode apagar cookies nas configurações do navegador. Isso pode resetar sua lista de desejos anônima. Para alertas de preço vinculados ao e-mail, use o link de cancelamento presente nas mensagens ou contate-nos.',
        ],
      },
    ],
  };
}

export function buildLegalPageMetadata(
  brand: BrandConfig,
  content?: LegalPageContent,
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
  const resolved = content ?? buildDefaultLegalPageContent(brand);
  const title = seo?.seoTitle?.trim()
    ? seo.seoTitle.trim()
    : formatWebPageTitle(resolved.title, brand);
  const description = seo?.seoDescription?.trim() ?? resolved.intro.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `${brand.url}/legal` },
    openGraph: {
      title,
      description,
      url: `${brand.url}/legal`,
    },
  };
}
