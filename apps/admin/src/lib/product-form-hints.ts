export const PRODUCT_SEO_TITLE_GOOGLE_LIMIT = 60;
export const PRODUCT_SEO_DESCRIPTION_GOOGLE_LIMIT = 160;
export const PRODUCT_META_TITLE_MAX = 200;
export const PRODUCT_META_DESCRIPTION_MAX = 320;

export const PRODUCT_FORM_HINTS = {
  affiliateLink:
    'Cole a URL completa com sua tag de afiliado. O sistema identifica o marketplace e o código do produto automaticamente.',
  marketplace:
    'Preenchido ao colar o link. Só altere manualmente se a detecção falhar — o parceiro define regras de tag e comissão.',
  externalId:
    'Código único no marketplace (ex.: ASIN na Amazon). Usado para sincronizar preço e metadados no worker.',
  titleClean:
    'Nome editorial exibido na vitrine e na página do produto. Evite códigos internos e textos promocionais do marketplace.',
  titleRaw:
    'Título original do marketplace (opcional). Se vazio, usa o título limpo. Útil para referência quando o worker sincronizar metadados.',
  category:
    'Escolha a subcategoria folha mais específica. Define templates de especificações e ajuda na navegação e SEO da vitrine.',
  editorialScore:
    'Nota de 0 a 10 da sua curadoria. Acima de 8,0 o produto pode receber o selo "Escolha editorial" na vitrine.',
  rating:
    'Nota média do marketplace (0 a 5). Exibida na vitrine e usada no selo "Top avaliado" (≥ 4,5 com 50+ avaliações).',
  reviewCount:
    'Quantidade de avaliações no marketplace. Complementa a nota para estrelas e selos na vitrine.',
  tags: 'Etiquetas internas para organização (ex.: gamer, home-office). Não aparecem na vitrine pública no MVP.',
  strikethroughPrice:
    'Preço de referência opcional (ex.: "De R$"). Só exibido se "Exibir valor numérico" estiver ativo e o preço não estiver desatualizado.',
  price:
    'Preço atual usado na vitrine quando a exibição numérica está ativa. O worker tenta atualizar periodicamente via filas.',
  shouldShowPrice:
    'Desative se o preço oscila muito — a vitrine mostra "Consultar preço atualizado" e evita valores incorretos (regra de 24h).',
  visible:
    'Controla se o produto aparece nos blocos da home. Continua acessível pela URL de detalhe e no painel admin.',
  availability:
    'Status editorial de estoque. Não substitui o estoque real do marketplace — informa o visitante na página.',
  pros: 'Pontos fortes da sua análise. Alimentam a apresentação rápida e o prompt de IA (✨) quando vazia.',
  cons: 'Limitações honestas do produto. Reforçam credibilidade editorial e ajudam na decisão de compra.',
  shortDescription:
    'Texto curto para cards e introdução. Se vazio ao salvar, a API monta automaticamente a partir dos prós.',
  longDescription:
    'Review completo em HTML. Use o editor visual ou cole saída da IA na aba Código HTML — tags: h3, p, strong, table, ul, li, links.',
  specsBlocks:
    'Organize a ficha técnica em blocos colapsáveis (ex.: Detalhes, Medidas). Cada bloco agrupa pares chave/valor exibidos na vitrine.',
  specsSuggestedBlock:
    'Cria um bloco pré-preenchido com atributos sugeridos pela categoria. Você pode editar títulos e valores livremente.',
  images:
    'A primeira imagem é a capa na vitrine e listagens. Prefira upload quadrado 1:1 (1000×1000 px) ou URLs HTTPS externas com licença adequada.',
  metaTitle:
    'Sobrescreve o título automático da página. Ideal ≤ 60 caracteres visíveis no Google; vazio usa o título gerado pelo sistema.',
  metaDescription:
    'Sobrescreve o snippet de busca. Alvo: 140–160 caracteres com curadoria e contexto de preço, sem urgência falsa.',
} as const;
