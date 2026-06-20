import { adminMarketplaceLabel } from '@/lib/product-admin-format';
import type { SpecGroup } from '@ecommerce-amazon/shared/product';
import { flattenSpecGroups } from '@ecommerce-amazon/shared/product';
import { isRecord } from '@ecommerce-amazon/shared/utils/type-guards';

export type ProductLlmPromptInput = {
  titleClean: string;
  marketplace: string;
  categoryLabel?: string | undefined;
  editorialScore: number;
  pros: string[];
  cons: string[];
  affiliateLink?: string | undefined;
};

export type ProductSeoLlmPromptInput = {
  titleClean: string;
  marketplace: string;
  categoryPathLabel: string;
  editorialScore: number;
  pros: string[];
  cons: string[];
  shortDescription: string;
  specsNormalized: SpecGroup[];
  autoMetaTitle: string;
  autoMetaDescription: string;
  metaTitle?: string | undefined;
  metaDescription?: string | undefined;
};

export type ProductSeoLlmResponse = {
  metaTitle: string;
  metaDescription: string;
};

const PRODUCT_META_TITLE_MAX = 200;
const PRODUCT_META_DESCRIPTION_MAX = 320;

function formatBulletList(items: string[], emptyFallback: string): string {
  if (items.length === 0) {
    return emptyFallback;
  }
  return items.map((item) => `- ${item}`).join('\n');
}

function formatSpecsList(groups: SpecGroup[]): string {
  const flatSpecs = flattenSpecGroups(groups);
  const entries = Object.entries(flatSpecs).filter(([key, value]) => key.trim() && value.trim());
  if (entries.length === 0) {
    return '- (nenhuma especificação preenchida no formulário)';
  }

  const groupedLines: string[] = [];
  for (const group of groups) {
    const activeProperties = group.properties.filter(
      (property) => property.key.trim() && property.value.trim(),
    );
    if (activeProperties.length === 0) {
      continue;
    }
    groupedLines.push(`### ${group.group_title}`);
    for (const property of activeProperties.slice(0, 6)) {
      groupedLines.push(`- ${property.key}: ${property.value}`);
    }
  }

  return (
    groupedLines.slice(0, 16).join('\n') ||
    entries
      .slice(0, 12)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n')
  );
}

export function buildProductSeoLlmPrompt(input: ProductSeoLlmPromptInput): string {
  const title = input.titleClean.trim() || '[Título do produto]';
  const marketplace = adminMarketplaceLabel(input.marketplace);
  const pros = formatBulletList(input.pros, '- (preencha os prós no formulário)');
  const cons = formatBulletList(input.cons, '- (preencha os contras no formulário)');
  const specs = formatSpecsList(input.specsNormalized);
  const score =
    Number.isFinite(input.editorialScore) && input.editorialScore > 0
      ? `${input.editorialScore.toFixed(1)}/10`
      : 'Não informada';
  const shortDescription = input.shortDescription.trim() || '(vazio — pode ser gerado dos prós)';
  const currentTitle = input.metaTitle?.trim() || '(vazio — vitrine usará o automático)';
  const currentDescription =
    input.metaDescription?.trim() || '(vazio — vitrine usará o automático)';

  return `Você é um especialista em SEO on-page para uma vitrine editorial de afiliados no Brasil (Amazon, Shopee e Mercado Livre). Escreva em português do Brasil, tom informativo, confiável e editorial — sem clickbait, sem inventar preços/cupons e sem urgência falsa.

## Produto
- Nome (palavra-chave principal): ${title}
- Marketplace parceiro: ${marketplace}
- Categoria vertical: ${input.categoryPathLabel}
- Nota editorial da equipe: ${score}

## Contexto editorial já cadastrado
### Prós
${pros}

### Contras
${cons}

### Apresentação rápida
${shortDescription}

### Especificações relevantes
${specs}

## Metadados atuais no admin (referência)
- Meta Title sobrescrito: ${currentTitle}
- Meta Description sobrescrita: ${currentDescription}

## Templates automáticos do sistema (ponto de partida — melhore, não copie literalmente)
- Title automático: ${input.autoMetaTitle}
- Description automática: ${input.autoMetaDescription}

## Sua tarefa
Gere **somente** um bloco JSON válido (sem markdown, sem \`\`\` fences) com exatamente estas chaves:

{
  "metaTitle": "...",
  "metaDescription": "..."
}

### Regras para metaTitle
- Alvo: ≤ 60 caracteres visíveis no Google (máximo técnico ${PRODUCT_META_TITLE_MAX}).
- Inclua o nome do produto (${title}) no início ou perto dele.
- Comunique análise editorial / prós e contras / ofertas curadas — sem "Compre agora" genérico.
- Pode usar sufixo discreto (ex.: "| Análise e Ofertas") se couber no limite.
- Evite CAPS LOCK, emojis e promessas não sustentadas pelos prós/contras acima.

### Regras para metaDescription
- Alvo: 140–160 caracteres para snippet do Google (máximo técnico ${PRODUCT_META_DESCRIPTION_MAX}).
- Resuma a proposta de valor editorial: para quem é, destaques honestos e convite a comparar preço no ${marketplace}.
- Mencione curadoria, análise ou monitoramento de preço de forma natural — **não** invente desconto, cupom, estoque ou countdown.
- CTA transparente se necessário: "Ver preço na ${marketplace}" — nunca "Compre agora" genérico.
- Não repita o metaTitle inteiro; complemente com benefício e intenção de busca.

### Conformidade (obrigatório)
- Proibido: preço fictício, cupom não verificado, "últimas unidades", "X pessoas comprando", superlativos vazios.
- Baseie-se apenas nos prós, contras e specs fornecidos; não invente especificações técnicas.
- Otimize para buscas informacionais e transacionais moderadas (review + onde comprar).

Responda **somente** com o JSON final, sem explicações antes ou depois.`;
}

export function parseProductSeoLlmResponse(raw: string): ProductSeoLlmResponse {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('JSON não encontrado na resposta. Cole o objeto retornado pela IA.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(
      'JSON inválido. Verifique se a IA retornou apenas o objeto metaTitle/metaDescription.',
    );
  }

  if (!isRecord(parsed)) {
    throw new Error('Formato inesperado na resposta da IA.');
  }

  const record = parsed;
  const metaTitleRaw =
    typeof record['metaTitle'] === 'string'
      ? record['metaTitle']
      : typeof record['seoTitle'] === 'string'
        ? record['seoTitle']
        : '';
  const metaDescriptionRaw =
    typeof record['metaDescription'] === 'string'
      ? record['metaDescription']
      : typeof record['seoDescription'] === 'string'
        ? record['seoDescription']
        : '';

  const metaTitle = metaTitleRaw.trim();
  const metaDescription = metaDescriptionRaw.trim();

  if (!metaTitle) {
    throw new Error('O JSON deve conter metaTitle (ou seoTitle) não vazio.');
  }
  if (!metaDescription) {
    throw new Error('O JSON deve conter metaDescription (ou seoDescription) não vazio.');
  }

  return {
    metaTitle: metaTitle.slice(0, PRODUCT_META_TITLE_MAX),
    metaDescription: metaDescription.slice(0, PRODUCT_META_DESCRIPTION_MAX),
  };
}

export function buildProductReviewLlmPrompt(input: ProductLlmPromptInput): string {
  const title = input.titleClean.trim() || '[Título do produto]';
  const marketplace = adminMarketplaceLabel(input.marketplace);
  const category = input.categoryLabel ?? 'Não informada';
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
