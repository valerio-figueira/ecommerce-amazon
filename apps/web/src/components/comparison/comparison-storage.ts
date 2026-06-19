'use client';

import { z } from 'zod';

const STORAGE_KEY = 'vitrine:comparison-selection';

export type ComparisonSelectionItem = {
  productId: string;
  slug: string;
  title: string;
  imageUrl?: string | undefined;
  categoryId?: string | undefined;
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
};

const comparisonSelectionItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  categoryLabel: z.string().optional(),
});

const comparisonSelectionSchema = z.array(comparisonSelectionItemSchema);

export type ComparisonToggleInput = ComparisonSelectionItem;

export type ComparisonToggleResult =
  | { ok: true }
  | { ok: false; reason: 'category_mismatch' | 'max_reached' };

export type ComparisonToastMessage = {
  text: string;
  variant: 'info' | 'warning';
};

export function readComparisonSelection(): ComparisonSelectionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = comparisonSelectionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

export function writeComparisonSelection(items: ComparisonSelectionItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function categoryKey(item: ComparisonSelectionItem): string {
  return item.categoryId ?? item.categorySlug ?? '__none__';
}

export function canAddComparisonItem(
  items: ComparisonSelectionItem[],
  candidate: ComparisonToggleInput,
): ComparisonToggleResult {
  if (items.some((item) => item.productId === candidate.productId)) {
    return { ok: true };
  }
  if (items.length >= 3) {
    return { ok: false, reason: 'max_reached' };
  }
  if (items.length > 0 && categoryKey(items[0]!) !== categoryKey(candidate)) {
    return { ok: false, reason: 'category_mismatch' };
  }
  return { ok: true };
}

export function toggleComparisonSelection(
  items: ComparisonSelectionItem[],
  candidate: ComparisonToggleInput,
): { items: ComparisonSelectionItem[]; result: ComparisonToggleResult } {
  const existingIndex = items.findIndex((item) => item.productId === candidate.productId);
  if (existingIndex >= 0) {
    return {
      items: items.filter((item) => item.productId !== candidate.productId),
      result: { ok: true },
    };
  }

  const gate = canAddComparisonItem(items, candidate);
  if (!gate.ok) {
    return { items, result: gate };
  }

  return {
    items: [...items, candidate],
    result: { ok: true },
  };
}
