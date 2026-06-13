export type CategoryNavNode = {
  slug: string;
  label: string;
  icon?: string | undefined;
  productCount?: number | undefined;
  subcategories?: CategoryNavNode[] | undefined;
};

export function findCategoryNodeBySlug(
  nodes: CategoryNavNode[],
  slug: string,
): CategoryNavNode | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return node;
    }
    if (node.subcategories?.length) {
      const match = findCategoryNodeBySlug(node.subcategories, slug);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

export function getDirectChildren(
  nodes: CategoryNavNode[],
  slug: string,
): CategoryNavNode[] {
  const node = findCategoryNodeBySlug(nodes, slug);
  return node?.subcategories ?? [];
}

export function getAncestorSlugs(nodes: CategoryNavNode[], slug: string): string[] {
  const ancestors: string[] = [];

  function walk(branch: CategoryNavNode[], path: string[]): boolean {
    for (const node of branch) {
      const nextPath = [...path, node.slug];
      if (node.slug === slug) {
        ancestors.push(...path);
        return true;
      }
      if (node.subcategories?.length && walk(node.subcategories, nextPath)) {
        return true;
      }
    }
    return false;
  }

  walk(nodes, []);
  return ancestors;
}

export function getRootSlugForCategory(nodes: CategoryNavNode[], slug: string): string | null {
  const ancestors = getAncestorSlugs(nodes, slug);
  if (ancestors.length > 0) {
    return ancestors[0] ?? null;
  }
  return findCategoryNodeBySlug(nodes, slug) ? slug : null;
}

export function isCategoryDescendantOf(
  nodes: CategoryNavNode[],
  ancestorSlug: string,
  descendantSlug: string,
): boolean {
  if (ancestorSlug === descendantSlug) {
    return true;
  }
  const ancestors = getAncestorSlugs(nodes, descendantSlug);
  return ancestors.includes(ancestorSlug);
}
