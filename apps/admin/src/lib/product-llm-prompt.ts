import { adminMarketplaceLabel } from '@/lib/product-admin-format';
import { getProductCategoryVerticalLabel } from '@ecommerce-amazon/shared/product/category-vertical';

export type ProductLlmPromptInput = {
  titleClean: string;
  marketplace: string;
  categoryVertical?: string | undefined;
  editorialScore: number;
  pros: string[];
  cons: string[];
  affiliateLink?: string | undefined;
};

function formatBulletList(items: string[], emptyFallback: string): string {
  if (items.length === 0) {
    return emptyFallback;
  }
  return items.map((item) => `- ${item}`).join('\n');
}

export function buildProductReviewLlmPrompt(input: ProductLlmPromptInput): string {
  const title = input.titleClean.trim() || '[Título do produto]';
  const marketplace = adminMarketplaceLabel(input.marketplace);
  const category =
    getProductCategoryVerticalLabel(input.categoryVertical) ??
    input.categoryVertical ??
    'Não informada';
  const pros = formatBulletList(input.pros, '- (preencha os prós no formulário)');
  const cons = formatBulletList(input.cons, '- (preencha os contras no formulário)');
  const score =
    Number.isFinite(input.editorialScore) && input.editorialScore > 0
      ? `${input.editorialScore.toFixed(1)}/10`
      : 'Não informada';
  const link = input.affiliateLink?.trim() || 'Não informado';

  return `Você é um redator sênior de reviews de produtos para uma vitrine editorial de afiliados no Brasil (Amazon, Shopee e Mercado Livre). Escreva em português do Brasil, tom claro, honesto e persuasivo — sem exageros, sem inventar especificações e sem prometer o que não está nos dados abaixo.

## Produto
- Nome: ${title}
- Marketplace: ${marketplace}
- Categoria vertical: ${category}
- Nota editorial da equipe: ${score}
- Link de referência (contexto; não inclua URL crua no HTML final): ${link}

## Prós já levantados pela equipe
${pros}

## Contras já levantados pela equipe
${cons}

## Sua tarefa
Gere uma **análise editorial completa em HTML puro** (sem markdown, sem \`\`\` fences) para colar no campo \`long_description_html\` do painel admin.

### Estrutura obrigatória (use exatamente estas seções com <h3>)
1. <h3>Visão geral</h3> — 2 parágrafos contextualizando o produto e para quem faz sentido.
2. <h3>Destaques e especificações</h3> — parágrafo + <table> simples (2 colunas: Característica | Detalhe) com 4–6 linhas baseadas nos prós e no contexto do produto. Não invente specs técnicas não inferíveis.
3. <h3>Pontos positivos</h3> — expanda cada pró em parágrafos curtos com <strong> nos termos-chave.
4. <h3>Pontos de atenção</h3> — contras honestos, sem minimizar problemas reais.
5. <h3>Para quem vale a pena</h3> — perfis de comprador (ex.: home office, gamer, uso corporativo).
6. <h3>Veredicto editorial</h3> — conclusão equilibrada alinhada à nota ${score}; convide a comparar preço no marketplace parceiro sem usar "compre agora" genérico.

### Regras de conformidade (obrigatório)
- Tags permitidas: h3, p, strong, table, thead, tbody, tr, th, td, ul, li.
- Proibido: countdown falso, "X pessoas comprando", estoque inventado, preço fictício, cupom não verificado.
- CTA transparente se mencionar compra: "Ver preço na ${marketplace}" — nunca "Comprar agora" genérico.
- Não inclua links <a> no HTML (a vitrine cuida do CTA de afiliado).
- Extensão alvo: 600–900 palavras.
- Responda **somente** com o HTML final, sem explicações antes ou depois.`;
}
