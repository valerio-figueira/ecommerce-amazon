export function readTooltipSharePercent(item: unknown): number | undefined {
  if (typeof item !== 'object' || item === null || !('payload' in item)) {
    return undefined;
  }

  const payload = Reflect.get(item, 'payload');
  if (typeof payload !== 'object' || payload === null || !('sharePercent' in payload)) {
    return undefined;
  }

  const share = Reflect.get(payload, 'sharePercent');
  return typeof share === 'number' ? share : undefined;
}

export function formatCountWithShare(value: unknown, item: unknown): [string, string] {
  const share = readTooltipSharePercent(item);
  return [
    `${String(value)} cliques${typeof share === 'number' ? ` (${share}%)` : ''}`,
    'Total',
  ];
}
