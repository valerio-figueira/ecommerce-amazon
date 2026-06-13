const MARKETPLACE_LABELS: Record<string, string> = {
  amazon_br: 'Amazon Brasil',
  shopee_br: 'Shopee Brasil',
  mercadolivre_br: 'Mercado Livre',
};

export function adminMarketplaceLabel(marketplace: string): string {
  return MARKETPLACE_LABELS[marketplace] ?? marketplace;
}

export function formatEditorialScore(storedScore: number): string {
  return (storedScore / 10).toFixed(1);
}
