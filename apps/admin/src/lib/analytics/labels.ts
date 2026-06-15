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

const PLACEMENT_LABELS: Record<string, string> = {
  'article.embed': 'Embed em artigo',
  'article.comparison': 'Comparativo no artigo',
  'article.related': 'Artigos relacionados',
  article_listing: 'Listagem de artigos',
  'cms.product_grid': 'Grade CMS',
  'cms.featured_product': 'Produto destaque CMS',
  'cms.bento_offer': 'Bento — oferta',
  'cms.bento_list': 'Bento — lista',
  'cms.bento_article': 'Bento — artigo',
  'cms.curated_collection': 'Coleção curada CMS',
  'product.detail_cta': 'CTA detalhe produto',
  'product.similar': 'Carrossel similares',
  'category.listing': 'Listagem categoria',
  'collection.page': 'Página de coleção',
  'wishlist.drawer': 'Lista de desejos',
};

export function marketplaceLabel(marketplace: string): string {
  return MARKETPLACE_LABELS[marketplace] ?? marketplace;
}

export function formatClickIndex(index: number | null | undefined): string {
  if (index == null || Number.isNaN(index)) return '—';
  if (index === 1) return '1× (proporcional)';
  return `${index.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×`;
}

export function clickOriginLabel(origin: string): string {
  return ORIGIN_LABELS[origin] ?? origin;
}

export function clickPlacementLabel(placement: string): string {
  return PLACEMENT_LABELS[placement] ?? placement;
}
