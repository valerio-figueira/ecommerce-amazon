export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
}

export function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

/** Contracted preposition + marketplace name, e.g. "na Amazon", "no Mercado Livre". */
export function marketplaceWithPreposition(marketplace: string): string {
  if (marketplace === 'mercadolivre_br') return 'no Mercado Livre';
  const label = marketplaceLabel(marketplace);
  return `na ${label}`;
}

/** Definite article + marketplace name, e.g. "a Amazon", "o Mercado Livre". */
export function marketplaceWithDefiniteArticle(marketplace: string): string {
  if (marketplace === 'mercadolivre_br') return 'o Mercado Livre';
  const label = marketplaceLabel(marketplace);
  return `a ${label}`;
}

export function affiliatePriceCtaLabel(marketplace: string): string {
  return `Ver ${marketplaceWithPreposition(marketplace)}`;
}
