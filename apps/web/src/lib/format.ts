export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
}

export function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  return marketplace;
}
