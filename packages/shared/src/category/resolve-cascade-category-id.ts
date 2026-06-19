export type CategoryCascadeOption = {
  id: string;
  isLeaf: boolean;
  parentId?: string | null;
};

export type CategoryCascadeLevels = {
  level1?: string | undefined;
  level2?: string | undefined;
  level3?: string | undefined;
  level4?: string | undefined;
};

export const CATEGORY_CASCADE_LEVEL_KEYS = [
  'level1',
  'level2',
  'level3',
  'level4',
] as const satisfies ReadonlyArray<keyof CategoryCascadeLevels>;

export function buildCascadePath(
  categoryId: string | undefined,
  options: CategoryCascadeOption[],
): CategoryCascadeLevels {
  if (!categoryId) {
    return {};
  }

  const byId = new Map(options.map((option) => [option.id, option]));
  const path: string[] = [];
  let current = byId.get(categoryId);

  while (current) {
    path.unshift(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return {
    ...(path[0] !== undefined ? { level1: path[0] } : {}),
    ...(path[1] !== undefined ? { level2: path[1] } : {}),
    ...(path[2] !== undefined ? { level3: path[2] } : {}),
    ...(path[3] !== undefined ? { level4: path[3] } : {}),
  };
}

export function resolveLeafCategoryId(
  levels: CategoryCascadeLevels,
  options: CategoryCascadeOption[],
): string | undefined {
  const deepestId =
    levels.level4 ?? levels.level3 ?? levels.level2 ?? levels.level1;

  if (!deepestId) {
    return undefined;
  }

  const option = options.find((item) => item.id === deepestId);
  if (!option?.isLeaf) {
    return undefined;
  }

  return deepestId;
}

export function hasIncompleteCascadeSelection(
  levels: CategoryCascadeLevels,
  options: CategoryCascadeOption[],
): boolean {
  const deepestId =
    levels.level4 ?? levels.level3 ?? levels.level2 ?? levels.level1;

  if (!deepestId) {
    return false;
  }

  const option = options.find((item) => item.id === deepestId);
  return option !== undefined && !option.isLeaf;
}

export function isStoredCategoryIdValidLeaf(
  categoryId: string | undefined,
  options: CategoryCascadeOption[],
): boolean {
  if (!categoryId) {
    return true;
  }

  const option = options.find((item) => item.id === categoryId);
  return option?.isLeaf === true;
}
