export const PRODUCT_CATEGORY_VERTICALS = [
  { slug: 'home-office', label: 'Home Office' },
  { slug: 'games', label: 'Games' },
  { slug: 'eletronicos', label: 'Eletrônicos' },
] as const;

export type ProductCategoryVerticalSlug = (typeof PRODUCT_CATEGORY_VERTICALS)[number]['slug'];

export const productCategoryVerticalSlugs = [
  'home-office',
  'games',
  'eletronicos',
] as const satisfies readonly ProductCategoryVerticalSlug[];

export function getProductCategoryVerticalLabel(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  return PRODUCT_CATEGORY_VERTICALS.find((item) => item.slug === slug)?.label;
}
