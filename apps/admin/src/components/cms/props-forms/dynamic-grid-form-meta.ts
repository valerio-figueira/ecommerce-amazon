export type CategoryVerticalMeta = {
  emoji: string;
  label: string;
};

export const CATEGORY_VERTICAL_META: Record<string, CategoryVerticalMeta> = {
  'home-office': { emoji: '🏠', label: 'Home Office & Escritório' },
  games: { emoji: '🎮', label: 'Equipamentos Gamer' },
  eletronicos: { emoji: '📱', label: 'Smartphones & Eletrônicos' },
};

export type SortByOption = {
  value: string;
  label: string;
};

export const PRIMARY_SORT_BY_OPTIONS: SortByOption[] = [
  {
    value: 'editorial_score',
    label: '🏆 Recomendações dos Especialistas (Melhor Nota)',
  },
  {
    value: 'created_at',
    label: '📅 Produtos Adicionados Recentemente',
  },
  {
    value: 'price_asc',
    label: '💰 Menores Preços Primeiro',
  },
];

export const LEGACY_SORT_BY_OPTION: SortByOption = {
  value: 'price_desc',
  label: '💸 Maiores Preços Primeiro',
};

export const LIMIT_PRESETS = [4, 8, 12, 16] as const;

export const ALL_CATEGORY_VALUE = '__all__';

export function getCategoryDisplayLabel(slug: string, apiLabel: string): string {
  const meta = CATEGORY_VERTICAL_META[slug];
  if (meta) return `${meta.emoji} ${meta.label}`;
  return `📦 ${apiLabel}`;
}

export function getDiscountLabel(value: number): string {
  if (value === 0) return 'Qualquer preço';
  return `Apenas acima de ${value}% OFF`;
}

export function getSortByOptions(currentValue?: string): SortByOption[] {
  if (currentValue === LEGACY_SORT_BY_OPTION.value) {
    return [...PRIMARY_SORT_BY_OPTIONS, LEGACY_SORT_BY_OPTION];
  }
  return PRIMARY_SORT_BY_OPTIONS;
}

export function translateZodError(message: string, path: string[]): string {
  if (path.includes('title') && message.includes('at least')) {
    return 'O título precisa ter pelo menos 3 caracteres.';
  }
  if (path.includes('title') && message.includes('at most')) {
    return 'O título pode ter no máximo 60 caracteres.';
  }
  return message;
}
