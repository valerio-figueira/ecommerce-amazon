export const BENTO_SLOT1_CONTENT_TYPE_OPTIONS = [
  { value: 'collection', label: 'Coleção curada' },
  { value: 'article', label: 'Artigo editorial' },
] as const;

export const BENTO_SLOT3_CONTENT_TYPE_OPTIONS = [
  { value: 'category', label: 'Top 3 da categoria' },
  { value: 'products', label: 'Produtos escolhidos (até 3)' },
] as const;

export const BENTO_SLOT_LABELS = {
  slot1: 'Slot 1 — Destaque grande (2×2)',
  slot2: 'Slot 2 — Oferta relâmpago',
  slot3: 'Slot 3 — Mini-lista vertical',
} as const;
