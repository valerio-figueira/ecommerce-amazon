import type { CategoryRepository } from '@ecommerce-amazon/domain';
import { buildCategoryTree } from '@ecommerce-amazon/shared/category/build-category-tree';
import type { PublicCategoryTreeNode } from '@ecommerce-amazon/shared/category/category-schemas';

import { computeSubtreeProductCounts } from './category.helpers.js';

type CategoryTreeSourceNode = {
  id: string;
  slug: string;
  label: string;
  parentId?: string | null;
  sortOrder: number;
  icon?: string | undefined;
  productCount: number;
};

export class ListCategoryTree {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<{ items: PublicCategoryTreeNode[] }> {
    const categories = (await this.categoryRepository.listAll()).filter(
      (category) => category.visible,
    );
    const counts = await computeSubtreeProductCounts(this.categoryRepository, true);

    const tree = buildCategoryTree<{
      icon?: string | undefined;
      productCount: number;
    }>(
      categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        label: category.label,
        parentId: category.parentId ?? null,
        sortOrder: category.sortOrder,
        icon: category.icon,
        productCount: counts.get(category.id) ?? 0,
      })),
    );

    return {
      items: tree.map(toPublicTreeNode),
    };
  }
}

function toPublicTreeNode(
  node: CategoryTreeSourceNode & { subcategories?: CategoryTreeSourceNode[] },
): PublicCategoryTreeNode {
  return {
    slug: node.slug,
    label: node.label,
    ...(node.icon ? { icon: node.icon } : {}),
    productCount: node.productCount,
    ...(node.subcategories?.length
      ? { subcategories: node.subcategories.map(toPublicTreeNode) }
      : {}),
  };
}
