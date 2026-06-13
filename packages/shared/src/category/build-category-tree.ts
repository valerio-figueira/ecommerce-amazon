export type FlatCategoryNode<T extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  slug: string;
  label: string;
  parentId?: string | null;
  sortOrder: number;
} & T;

export type CategoryTreeNode<T extends Record<string, unknown> = Record<string, unknown>> =
  FlatCategoryNode<T> & {
    subcategories?: CategoryTreeNode<T>[];
  };

export function buildCategoryTree<T extends Record<string, unknown>>(
  items: FlatCategoryNode<T>[],
): CategoryTreeNode<T>[] {
  const byParent = new Map<string | null, FlatCategoryNode<T>[]>();

  for (const item of items) {
    const parentKey = item.parentId ?? null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(item);
    byParent.set(parentKey, siblings);
  }

  function buildLevel(parentId: string | null): CategoryTreeNode<T>[] {
    const siblings = byParent.get(parentId) ?? [];
    return siblings
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
      .map((item) => {
        const children = buildLevel(item.id);
        return {
          ...item,
          ...(children.length > 0 ? { subcategories: children } : {}),
        };
      });
  }

  return buildLevel(null);
}

export function flattenCategoryTree<T extends Record<string, unknown>>(
  nodes: CategoryTreeNode<T>[],
  depth = 0,
): Array<CategoryTreeNode<T> & { depth: number }> {
  const result: Array<CategoryTreeNode<T> & { depth: number }> = [];

  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.subcategories?.length) {
      result.push(...flattenCategoryTree(node.subcategories, depth + 1));
    }
  }

  return result;
}

export function formatCategoryBreadcrumb(
  ancestors: Array<{ label: string }>,
  separator = ' → ',
): string {
  return ancestors.map((item) => item.label).join(separator);
}
