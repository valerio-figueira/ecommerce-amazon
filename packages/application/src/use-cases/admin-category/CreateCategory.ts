import { randomUUID } from 'node:crypto';

import { Category, ValidationError, type CategoryRepository } from '@ecommerce-amazon/domain';
import type { CreateCategoryBody, AdminCategoryTreeNode } from '@ecommerce-amazon/shared/admin';
import { buildCategoryTree } from '@ecommerce-amazon/shared/category/build-category-tree';

import {
  assertCategoryDepthAllowed,
  assertUniqueCategorySlug,
} from '../category/category.helpers.js';

export class CreateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryBody): Promise<{ id: string }> {
    await assertUniqueCategorySlug(this.categoryRepository, input.slug);

    if (input.parentId) {
      const parent = await this.categoryRepository.findById(input.parentId);
      if (!parent) {
        throw new ValidationError('Parent category not found');
      }
      await assertCategoryDepthAllowed(this.categoryRepository, input.parentId);
    }

    const now = new Date();
    const category = Category.create({
      id: randomUUID(),
      slug: input.slug,
      label: input.label.trim(),
      icon: input.icon,
      parentId: input.parentId ?? undefined,
      sortOrder: input.sortOrder ?? 0,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      descriptionHtml: input.descriptionHtml,
      amazonBrowseNode: input.amazonBrowseNode,
      mercadolivreCategoryId: input.mercadolivreCategoryId,
      shopeeCategoryId: input.shopeeCategoryId,
      visible: input.visible ?? true,
      createdAt: now,
      updatedAt: now,
    });

    await this.categoryRepository.save(category);
    return { id: category.id };
  }
}

export class ListAdminCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<{ items: AdminCategoryTreeNode[] }> {
    const categories = await this.categoryRepository.listAll();
    const tree = buildCategoryTree(
      categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        label: category.label,
        parentId: category.parentId ?? null,
        sortOrder: category.sortOrder,
      })),
    );

    const byId = new Map(categories.map((category) => [category.id, category]));

    return {
      items: tree.map((node) => toAdminTreeNode(node, byId)),
    };
  }
}

function toAdminTreeNode(
  node: ReturnType<typeof buildCategoryTree>[number],
  byId: Map<string, Category>,
): AdminCategoryTreeNode {
  const category = byId.get(node.id);
  if (!category) {
    throw new Error(`Category ${node.id} not found`);
  }

  return {
    id: category.id,
    slug: category.slug,
    label: category.label,
    icon: category.icon,
    parentId: category.parentId ?? null,
    sortOrder: category.sortOrder,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    descriptionHtml: category.descriptionHtml,
    amazonBrowseNode: category.amazonBrowseNode,
    mercadolivreCategoryId: category.mercadolivreCategoryId,
    shopeeCategoryId: category.shopeeCategoryId,
    visible: category.visible,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    ...(node.subcategories?.length
      ? { subcategories: node.subcategories.map((child) => toAdminTreeNode(child, byId)) }
      : {}),
  };
}
