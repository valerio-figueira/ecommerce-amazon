const META_TITLE_SUFFIX = ' — Análise e Ofertas';

export function buildProductMetaTitle(titleClean: string): string {
  const trimmed = titleClean.trim();
  return `${trimmed}${META_TITLE_SUFFIX}`;
}

export function buildProductMetaDescription(titleClean: string): string {
  const trimmed = titleClean.trim();
  return `Confira nossa avaliação detalhada sobre o(a) ${trimmed}. Descubra se vale a pena comprar, veja pontos positivos, negativos e onde encontrar pelo menor preço monitorado.`;
}

/** Editorial override: DB value when set, otherwise automated template. */
export function resolveProductMetaTitle(
  titleClean: string,
  editorialOverride?: string | null,
): string {
  const trimmed = editorialOverride?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildProductMetaTitle(titleClean);
}

/** Editorial override: DB value when set, otherwise automated template. */
export function resolveProductMetaDescription(
  titleClean: string,
  editorialOverride?: string | null,
): string {
  const trimmed = editorialOverride?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildProductMetaDescription(titleClean);
}
