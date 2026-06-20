export function buildShortDescriptionFromPros(pros: string[]): string | undefined {
  const highlights = pros
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);
  if (highlights.length === 0) {
    return undefined;
  }
  if (highlights.length === 1) {
    return `Destaque: ${highlights[0]}.`;
  }
  const last = highlights[highlights.length - 1];
  const leading = highlights.slice(0, -1).join(', ');
  return `Principais qualidades: ${leading} e ${last}.`;
}

export function resolveProductShortDescription(
  customValue: string | undefined,
  pros: string[],
): string | undefined {
  const trimmed = customValue?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildShortDescriptionFromPros(pros);
}
