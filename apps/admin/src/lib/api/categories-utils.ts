import type { AdminCategoryTreeNode } from '@ecommerce-amazon/shared/admin';
import { buildCategoryTree, flattenCategoryTree } from '@ecommerce-amazon/shared/category/build-category-tree';

export type CategoryFlatOption = {
  id: string;
  slug: string;
  label: string;
  depth: number;
  isLeaf: boolean;
  parentId?: string | null;
};

export function flattenAdminCategoriesForPicker(
  nodes: AdminCategoryTreeNode[],
): CategoryFlatOption[] {
  const allNodes = collectCategoryNodes(nodes);
  const childIds = new Set(
    allNodes.filter((node) => node.subcategories?.length).map((node) => node.id),
  );

  const tree = buildCategoryTree(
    allNodes.map((node) => ({
      id: node.id,
      slug: node.slug,
      label: node.label,
      parentId: node.parentId ?? null,
      sortOrder: node.sortOrder,
    })),
  );

  return flattenCategoryTree(tree).map((node) => ({
    id: node.id,
    slug: node.slug,
    label: node.label,
    depth: node.depth,
    isLeaf: !childIds.has(node.id),
    parentId: node.parentId ?? null,
  }));
}

export function collectCategoryNodes(nodes: AdminCategoryTreeNode[]): AdminCategoryTreeNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.subcategories ? collectCategoryNodes(node.subcategories) : []),
  ]);
}

export function collectCategoryDescendantIds(categoryId: string, nodes: AdminCategoryTreeNode[]): Set<string> {
  const all = collectCategoryNodes(nodes);
  const byParent = new Map<string | null, AdminCategoryTreeNode[]>();

  for (const node of all) {
    const parentKey = node.parentId ?? null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(node);
    byParent.set(parentKey, siblings);
  }

  const descendants = new Set<string>();

  function walk(parentId: string) {
    for (const child of byParent.get(parentId) ?? []) {
      descendants.add(child.id);
      walk(child.id);
    }
  }

  walk(categoryId);
  return descendants;
}

export type CategoryParentOption = {
  id: string;
  label: string;
  depth: number;
  pathLabel: string;
};

export function buildCategoryParentOptions(
  nodes: AdminCategoryTreeNode[],
  excludeIds: Set<string> = new Set(),
): CategoryParentOption[] {
  const options: CategoryParentOption[] = [];

  function walk(branch: AdminCategoryTreeNode[], depth: number, ancestors: string[]) {
    for (const node of [...branch].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))) {
      if (excludeIds.has(node.id)) {
        continue;
      }

      const pathLabel = [...ancestors, node.label].join(' → ');
      options.push({
        id: node.id,
        label: node.label,
        depth,
        pathLabel,
      });

      if (node.subcategories?.length) {
        walk(node.subcategories, depth + 1, [...ancestors, node.label]);
      }
    }
  }

  walk(nodes, 0, []);
  return options;
}

export function formatParentOptionLabel(option: CategoryParentOption): string {
  const indent = depthIndent(option.depth);
  return `${indent}${option.label}`;
}

export function buildCategorySlugChain(
  categoryId: string | undefined,
  options: CategoryFlatOption[],
): string[] {
  if (!categoryId) {
    return [];
  }

  const byId = new Map(options.map((option) => [option.id, option]));
  const chain: string[] = [];
  let current = byId.get(categoryId);

  while (current) {
    chain.unshift(current.slug);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return chain;
}

function depthIndent(depth: number): string {
  if (depth === 0) return '';
  return `${'│  '.repeat(depth - 1)}├─ `;
}
