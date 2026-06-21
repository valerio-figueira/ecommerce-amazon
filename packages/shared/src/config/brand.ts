import { normalizeSiteBaseUrl } from '../seo/product-canonical.js';

export const BRAND_DEFAULTS = {
  name: 'Vitrine',
  legalName: 'Vitrine Ltda',
  contactEmail: 'contato@vitrine.com.br',
  tagline: 'Curadoria inteligente',
  socials: {
    instagram: 'https://instagram.com/vitrine',
    telegram: 'https://t.me/vitrine_ofertas',
  },
} as const;

export type BrandSocials = {
  instagram: string;
  telegram: string;
};

export type BrandConfig = {
  name: string;
  legalName: string;
  contactEmail: string;
  tagline: string;
  url: string;
  socials: BrandSocials;
};

export type BrandEnvSource = {
  SITE_NAME?: string | undefined;
  NEXT_PUBLIC_SITE_NAME?: string | undefined;
  COMPANY_LEGAL_NAME?: string | undefined;
  CONTACT_EMAIL?: string | undefined;
  SITE_TAGLINE?: string | undefined;
  WEB_PUBLIC_URL?: string | undefined;
  NEXT_PUBLIC_SITE_URL?: string | undefined;
  WEB_PORT?: number | string | undefined;
  SITE_SOCIAL_INSTAGRAM?: string | undefined;
  SITE_SOCIAL_TELEGRAM?: string | undefined;
};

/** Undo bash `printf %q` or copy-paste of escaped .env values (e.g. `Desk\ Setup`). */
export function unescapeShellEnvValue(value: string): string {
  return value.replace(/\\([\\'"$` \n\r\t])/g, '$1');
}

function resolveBrandText(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }
  return unescapeShellEnvValue(trimmed);
}

function resolveSiteName(source: BrandEnvSource): string {
  return resolveBrandText(source.SITE_NAME ?? source.NEXT_PUBLIC_SITE_NAME, BRAND_DEFAULTS.name);
}

function nonEmptyEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveSiteUrl(source: BrandEnvSource): string {
  const webPort = source.WEB_PORT ?? 3001;
  const fallback = `http://localhost:${webPort}`;
  const raw =
    nonEmptyEnvValue(source.WEB_PUBLIC_URL) ??
    nonEmptyEnvValue(source.NEXT_PUBLIC_SITE_URL) ??
    fallback;
  return normalizeSiteBaseUrl(raw);
}

export function createBrandConfig(source: BrandEnvSource = process.env): BrandConfig {
  const name = resolveSiteName(source);

  return {
    name,
    legalName: resolveBrandText(source.COMPANY_LEGAL_NAME, BRAND_DEFAULTS.legalName),
    contactEmail: resolveBrandText(source.CONTACT_EMAIL, BRAND_DEFAULTS.contactEmail),
    tagline: resolveBrandText(source.SITE_TAGLINE, BRAND_DEFAULTS.tagline),
    url: resolveSiteUrl(source),
    socials: {
      instagram: source.SITE_SOCIAL_INSTAGRAM ?? BRAND_DEFAULTS.socials.instagram,
      telegram: source.SITE_SOCIAL_TELEGRAM ?? BRAND_DEFAULTS.socials.telegram,
    },
  };
}

export function getBrandConfig(source: BrandEnvSource = process.env): BrandConfig {
  return createBrandConfig(source);
}

/** Env keys safe for Next.js Client Components (SSR + browser must match). */
export function createClientBrandEnvSource(env: BrandEnvSource = process.env): BrandEnvSource {
  return {
    NEXT_PUBLIC_SITE_NAME: env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  };
}

export function getClientBrandConfig(env: BrandEnvSource = process.env): BrandConfig {
  return createBrandConfig(createClientBrandEnvSource(env));
}

export function formatWebPageTitle(pageTitle: string, brand: BrandConfig): string {
  return `${pageTitle} | ${brand.name}`;
}

export function formatWebHomeTitle(brand: BrandConfig): string {
  return `${brand.name} — ${brand.tagline}`;
}

export function formatAdminPageTitle(pageTitle: string, brand: BrandConfig): string {
  return `${pageTitle} — ${brand.name} CMS`;
}

export function formatEditorialTeamName(brand: BrandConfig): string {
  return `Redação ${brand.name}`;
}

export function formatCopyrightNotice(
  brand: BrandConfig,
  year: number = new Date().getFullYear(),
): string {
  return `© ${year} ${brand.name}. Todos os direitos reservados.`;
}
