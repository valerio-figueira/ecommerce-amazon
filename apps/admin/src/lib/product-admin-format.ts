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

type AdminPriceLike = {
  amount: number | null;
  currency: string;
  isStale: boolean;
};

export function formatAdminProductPrice(price: AdminPriceLike): string {
  if (price.isStale || price.amount === null) {
    return 'Preço oculto na vitrine';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: price.currency || 'BRL',
  }).format(price.amount);
}
