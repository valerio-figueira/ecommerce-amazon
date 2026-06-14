import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';

export type ArticleLlmPromptInput = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  body: string;
  type: ArticleType;
  status: ArticleStatus;
  seoTitle: string;
  seoDescription: string;
};

const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  [ArticleType.GUIDE]: 'Guia editorial',
  [ArticleType.REVIEW]: 'Review',
  [ArticleType.COMPARISON]: 'Comparativo',
  [ArticleType.LOOKBOOK]: 'Lookbook / Social',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerptBodyPreview(body: string, maxLength = 400): string {
  const plain = stripHtml(body);
  if (plain.length === 0) return '(vazio)';
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}

export function buildArticleEditorialLlmPrompt(input: ArticleLlmPromptInput): string {
  const title = input.title.trim() || '[Título do artigo]';
  const slug = input.slug.trim() || 'slug-do-artigo';
  const typeLabel = ARTICLE_TYPE_LABELS[input.type];
  const statusLabel = input.status === ArticleStatus.PUBLISHED ? 'Publicado' : 'Rascunho';
  const excerpt = input.excerpt.trim() || '(vazio)';
  const cover = input.coverImageUrl.trim() || '(vazio — sugira URL de imagem livre de direitos ou descreva o banner ideal)';
  const seoTitle = input.seoTitle.trim() || '(vazio — vitrine usará o título)';
  const seoDescription = input.seoDescription.trim() || '(vazio — vitrine usará o resumo)';
  const bodyPreview = excerptBodyPreview(input.body);

  return `Você é um redator sênior de conteúdo editorial para uma vitrine de afiliados no Brasil (Amazon, Shopee e Mercado Livre). Escreva em português do Brasil, tom claro, útil e honesto — sem exageros, sem inventar preços/estoque e sem urgência falsa.

## Contexto do artigo
- Título atual: ${title}
- Slug (URL): /artigos/${slug}
- Tipo editorial: ${typeLabel}
- Status no painel: ${statusLabel}
- Resumo atual: ${excerpt}
- Capa (URL): ${cover}
- SEO title atual: ${seoTitle}
- SEO description atual: ${seoDescription}
- Prévia do corpo atual: ${bodyPreview}

## Sua tarefa
Gere **somente** um bloco JSON válido (sem markdown, sem \`\`\` fences) com exatamente estas chaves:

{
  "title": "...",
  "excerpt": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "coverImageUrl": "...",
  "body": "..."
}

### Regras para title
- Máximo 150 caracteres.
- Título editorial atrativo, específico ao nicho; evite clickbait.

### Regras para excerpt
- 1–3 frases (máx. ~500 caracteres).
- Resumo para listagens, Open Graph e introdução da página.

### Regras para seoTitle
- Ideal ≤ 60 caracteres visíveis no Google (máx. 200 no campo).
- Palavra-chave principal no início quando possível.

### Regras para seoDescription
- Alvo: 140–160 caracteres para snippet.
- Mencione curadoria editorial e comparação de preços nos marketplaces parceiros, sem inventar descontos.

### Regras para coverImageUrl
- URL https de imagem horizontal (banner 16:9 ou 21:9).
- Se não souber URL real, use string vazia "" e descreva o ideal apenas no campo body (não invente domínios falsos).

### Regras para body (HTML editorial)
- HTML puro para o editor da vitrine (sem markdown).
- Extensão alvo: **mínimo 800 palavras** para SEO (regra de anti-duplicação).
- Estrutura sugerida para ${typeLabel}:
  - <h2> ou <h3> para seções (Visão geral, O que avaliar, Recomendações, Conclusão).
  - Parágrafos curtos, listas <ul><li> quando útil.
  - **Inclua pelo menos 3 menções naturais a termos que poderiam virar links internos** (ex.: "cadeira ergonômica", "home office") — texto puro, sem tags <a> (a vitrine injeta links automaticamente).
- **Embeds de produto:** onde fizer sentido comercial, insira o shortcode exato [[product:slug-do-produto]] em linha própria (ex.: <p>[[product:cadeira-ergonomica-home-office]]</p>). Use slugs em kebab-case plausíveis ou placeholders claros como [[product:slug-exemplo]] com comentário no parágrafo anterior. O primeiro embed comercial deve aparecer **após pelo menos 300 palavras** de texto introdutório.
- Tags permitidas: h2, h3, p, strong, em, ul, ol, li, blockquote.
- Proibido: <a>, countdown falso, "X pessoas comprando", preços numéricos inventados, cupons não verificados, "Comprar agora" genérico.
- CTA transparente se mencionar compra: "Ver preço na Amazon" / "Ver preço na Shopee" — nunca prometa checkout na vitrine.

### Conformidade (obrigatório)
- Conteúdo original: pelo menos 1 insight editorial que não seja cópia de marketplace.
- Não cite APIs externas; preços e cards vêm do catálogo local em runtime.
- Responda **somente** com o JSON final, sem explicações antes ou depois.`;
}
