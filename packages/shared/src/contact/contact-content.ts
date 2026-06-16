import type { BrandConfig } from '../config/brand.js';
import { formatWebPageTitle } from '../config/brand.js';

export type ContactPageContent = {
  title: string;
  intro: string;
  emailLabel: string;
  email: string;
  socialHeading: string;
  legalLinkLabel: string;
  aboutLinkLabel: string;
};

export function buildContactPageContent(brand: BrandConfig): ContactPageContent {
  return {
    title: 'Contato',
    intro: `Tem dúvidas sobre nossa curadoria, privacidade ou parcerias? Fale com a equipe do ${brand.name}. Respondemos em prazo razoável, de segunda a sexta.`,
    emailLabel: 'E-mail',
    email: brand.contactEmail,
    socialHeading: 'Redes oficiais',
    legalLinkLabel: 'Políticas de Privacidade e Termos de Uso',
    aboutLinkLabel: 'Sobre nós',
  };
}

export function buildContactPageMetadata(brand: BrandConfig): {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: {
    title: string;
    description: string;
    url: string;
  };
} {
  const title = formatWebPageTitle('Contato', brand);
  const description = `Entre em contato com ${brand.name}. E-mail, redes sociais e links para políticas legais.`;

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
