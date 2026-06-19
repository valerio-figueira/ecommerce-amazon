export type ComparisonIntroProduct = {
  title: string;
  marketplace: string;
  editorialScore: number;
};

export type BuildComparisonEditorialIntroInput = {
  products: ComparisonIntroProduct[];
  categoryLabel?: string | undefined;
};

const MARKETPLACE_LABELS: Record<string, string> = {
  amazon_br: 'Amazon Brasil',
  shopee_br: 'Shopee Brasil',
  mercadolivre_br: 'Mercado Livre',
};

function marketplaceLabel(marketplace: string): string {
  return MARKETPLACE_LABELS[marketplace] ?? marketplace;
}

/**
 * Generates a Portuguese editorial intro for persisted comparison pages.
 * Targets Growth guideline (≥150 words) and API minimum (≥150 characters).
 */
export function buildComparisonEditorialIntro(
  input: BuildComparisonEditorialIntroInput,
): string {
  const { products, categoryLabel } = input;
  if (products.length < 2) {
    return 'Comparativo editorial entre produtos selecionados na vitrine.';
  }

  const titles = products.map((p) => p.title);
  const categoryPhrase = categoryLabel
    ? ` na categoria ${categoryLabel}`
    : ' disponíveis na vitrine';
  const productList = titles.slice(0, -1).join(', ') + ' e ' + titles[titles.length - 1];

  const paragraphs: string[] = [
    `Neste comparativo${categoryPhrase}, analisamos lado a lado ${productList}. ` +
      `A curadoria editorial prioriza transparência: reunimos preço atualizado do catálogo local, ` +
      `avaliações de compradores, especificações normalizadas e prós e contras redigidos pela equipe, ` +
      `sem copiar descrições genéricas dos marketplaces.`,
  ];

  for (const product of products) {
    paragraphs.push(
      `${product.title} é avaliado com nota editorial ${product.editorialScore.toFixed(1)} de 10. ` +
        `Os links levam à ${marketplaceLabel(product.marketplace)} para você conferir o preço final, ` +
        `frete e disponibilidade no momento da compra. Recomendamos comparar o custo total e a política ` +
        `de devolução antes de decidir.`,
    );
  }

  paragraphs.push(
    'Use a tabela abaixo para contrastar atributos técnicos e destaques editoriais. ' +
      'Quando o preço estiver indisponível no catálogo local, o botão ainda direciona ao marketplace ' +
      'parceiro para consulta em tempo real. Esta página é atualizada conforme o catálogo local; ' +
      'valores podem mudar sem aviso prévio na loja de origem.',
  );

  let text = paragraphs.join('\n\n');

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    text +=
      ' Nossa equipe monitora ofertas e revisa periodicamente os modelos listados para manter o ' +
      'comparativo útil a quem pesquisa antes de comprar. Priorize o modelo que melhor equilibra ' +
      'desempenho, preço e o que você realmente precisa no dia a dia.';
  }

  return text;
}

export function buildComparisonEphemeralIntro(
  input: BuildComparisonEditorialIntroInput,
): string {
  const titles = input.products.map((p) => p.title);
  const categoryPhrase = input.categoryLabel ? ` em ${input.categoryLabel}` : '';
  return `Comparativo rápido${categoryPhrase}: ${titles.join(' vs ')}. Confira preços, specs e prós/contras na tabela abaixo.`;
}
