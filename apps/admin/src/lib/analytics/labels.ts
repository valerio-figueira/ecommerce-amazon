const MARKETPLACE_LABELS: Record<string, string> = {
  amazon_br: 'Amazon',
  shopee_br: 'Shopee',
  mercadolivre_br: 'Mercado Livre',
};

const ORIGIN_LABELS: Record<string, string> = {
  listagem: 'Listagem',
  detalhe: 'Detalhe do produto',
  embed: 'Embed em artigo',
  comparador: 'Comparador',
  cupons: 'Cupons',
  coleção: 'Coleção',
  similar: 'Produtos similares',
  redirect_go: 'Redirect direto',
};

export function marketplaceLabel(marketplace: string): string {
  return MARKETPLACE_LABELS[marketplace] ?? marketplace;
}

export function clickOriginLabel(origin: string): string {
  return ORIGIN_LABELS[origin] ?? origin;
}
