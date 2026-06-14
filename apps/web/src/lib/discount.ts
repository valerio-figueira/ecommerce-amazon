export function computeDiscountPercent(
  amount: number | null,
  strikethrough: number | undefined,
): number | null {
  if (amount === null || strikethrough === undefined || strikethrough <= amount) {
    return null;
  }

  return Math.round(((strikethrough - amount) / strikethrough) * 100);
}
