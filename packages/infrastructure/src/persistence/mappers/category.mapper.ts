import { Category } from '@ecommerce-amazon/domain';

import type { schema } from '../drizzle/client.js';

type CategoryRow = typeof schema.categories.$inferSelect;

export function mapCategoryRowToDomain(row: CategoryRow): Category {
  return Category.create({
    id: row.id,
    slug: row.slug,
    label: row.label,
    icon: row.icon ?? undefined,
    parentId: row.parentId ?? undefined,
    sortOrder: row.sortOrder,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    descriptionHtml: row.descriptionHtml ?? undefined,
    amazonBrowseNode: row.amazonBrowseNode ?? undefined,
    mercadolivreCategoryId: row.mercadolivreCategoryId ?? undefined,
    shopeeCategoryId: row.shopeeCategoryId ?? undefined,
    visible: row.visible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function mapCategoryToRow(category: Category): typeof schema.categories.$inferInsert {
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
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
