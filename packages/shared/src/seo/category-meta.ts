const CATEGORY_SEO_TITLE_SUFFIX = ' | Melhores Ofertas e Análises';

export function buildCategorySeoTitle(label: string): string {
  const trimmed = label.trim();
  return `${trimmed}${CATEGORY_SEO_TITLE_SUFFIX}`;
}

export function buildCategorySeoDescription(label: string, parentLabel?: string | null): string {
  const trimmed = label.trim();
  const context =
    parentLabel?.trim() && parentLabel.trim() !== trimmed
      ? ` em ${parentLabel.trim()}`
      : '';

  return `Compare produtos curados em ${trimmed}${context}. Histórico de preços, análises editoriais e ofertas monitoradas na Amazon, Shopee e Mercado Livre.`;
}

/** Editorial override: DB value when set, otherwise automated template. */
export function resolveCategorySeoTitle(
  label: string,
  editorialOverride?: string | null,
): string {
  const trimmed = editorialOverride?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildCategorySeoTitle(label);
}

/** Editorial override: DB value when set, otherwise automated template. */
export function resolveCategorySeoDescription(
  label: string,
  editorialOverride?: string | null,
  parentLabel?: string | null,
): string {
  const trimmed = editorialOverride?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildCategorySeoDescription(label, parentLabel);
}
