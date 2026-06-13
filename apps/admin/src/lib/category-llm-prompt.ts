export type CategoryLlmPromptInput = {
  label: string;
  parentPathLabel?: string | null;
  autoSeoTitle: string;
  autoSeoDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  descriptionHtml?: string;
};

export function buildCategorySeoLlmPrompt(input: CategoryLlmPromptInput): string {
  const label = input.label.trim() || '[Nome da categoria]';
  const parentPath = input.parentPathLabel?.trim() || 'Raiz (sem pai)';
  const currentTitle = input.seoTitle?.trim() || '(vazio — vitrine usará o automático)';
  const currentDescription = input.seoDescription?.trim() || '(vazio — vitrine usará o automático)';
  const currentHtml = input.descriptionHtml?.trim() || '(vazio)';

  return `Você é um redator SEO sênior para uma vitrine editorial de afiliados no Brasil (Amazon, Shopee e Mercado Livre). Escreva em português do Brasil, tom informativo e confiável — sem exageros, sem inventar ofertas e sem prometer preços.

## Categoria
- Nome: ${label}
- Caminho na árvore: ${parentPath}

## Metadados atuais (referência)
- SEO title no admin: ${currentTitle}
- SEO description no admin: ${currentDescription}
- Conteúdo HTML no rodapé: ${currentHtml}

## Sugestões automáticas do sistema (ponto de partida)
- Title sugerido: ${input.autoSeoTitle}
- Description sugerida: ${input.autoSeoDescription}

## Sua tarefa
Gere **somente** um bloco JSON válido (sem markdown, sem \`\`\` fences) com exatamente estas chaves:

{
  "seoTitle": "...",
  "seoDescription": "...",
  "descriptionHtml": "..."
}

### Regras para seoTitle
- Máximo ~60 caracteres visíveis no Google (ideal ≤ 150 chars no campo).
- Inclua a palavra-chave principal (${label}) no início ou perto dele.
- Evite clickbait; pode usar sufixo editorial discreto (ex.: "| Ofertas curadas").

### Regras para seoDescription
- 140–160 caracteres ideal para snippet.
- Mencione comparação de preços, curadoria editorial e marketplaces parceiros de forma natural.
- Não invente descontos, cupons ou urgência falsa.

### Regras para descriptionHtml
- HTML puro para rodapé da página de listagem da categoria (2–4 parágrafos + opcional <ul> com 3–5 bullets).
- Tags permitidas: h2, h3, p, strong, ul, li.
- Proibido: links <a>, countdown, "X pessoas comprando", preços fictícios, cupons não verificados.
- Contextualize a categoria para quem busca produtos; se houver pai (${parentPath}), mencione a relação hierárquica quando fizer sentido.
- Extensão alvo: 120–250 palavras.

Responda **somente** com o JSON final, sem explicações antes ou depois.`;
}
