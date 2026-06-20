export function toNonEmptyStringTuple<T extends string>(
  values: readonly T[],
): [T, ...T[]] {
  const [first, ...rest] = values;
  if (first === undefined) {
    throw new Error('Expected at least one value');
  }
  return [first, ...rest];
}
