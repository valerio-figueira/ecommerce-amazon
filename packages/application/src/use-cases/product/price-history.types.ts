import type { PriceSnapshot } from '@ecommerce-amazon/domain';

export type PriceHistoryResult = {
  snapshots: PriceSnapshot[];
  days: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isPriceHistoryResult(value: unknown): value is PriceHistoryResult {
  return (
    isRecord(value) &&
    Array.isArray(value['snapshots']) &&
    typeof value['days'] === 'number'
  );
}
