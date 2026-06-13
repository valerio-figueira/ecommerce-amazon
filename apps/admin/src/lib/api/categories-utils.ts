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
  const allNodes = collectAllNodes(nodes);
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

function collectAllNodes(nodes: AdminCategoryTreeNode[]): AdminCategoryTreeNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.subcategories ? collectAllNodes(node.subcategories) : []),
  ]);
}
