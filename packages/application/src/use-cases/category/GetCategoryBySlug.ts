import { EntityNotFoundError, type CategoryRepository } from '@ecommerce-amazon/domain';
import type { PublicCategoryDetail } from '@ecommerce-amazon/shared/category/category-schemas';

import { computeSubtreeProductCounts } from './category.helpers.js';

export class GetCategoryBySlug {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(slug: string): Promise<PublicCategoryDetail | null> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category || !category.visible) {
      return null;
    }

    const ancestors = await this.categoryRepository.getAncestorChain(category.id);
    const children = (await this.categoryRepository.listChildren(category.id)).filter(
      (child) => child.visible,
    );
    const counts = await computeSubtreeProductCounts(this.categoryRepository, true);

    return {
      slug: category.slug,
      label: category.label,
      ...(category.seoTitle ? { seoTitle: category.seoTitle } : {}),
      ...(category.seoDescription ? { seoDescription: category.seoDescription } : {}),
      ...(category.descriptionHtml ? { descriptionHtml: category.descriptionHtml } : {}),
      productCount: counts.get(category.id) ?? 0,
      breadcrumbs: ancestors.map((item) => ({ slug: item.slug, label: item.label })),
      children: children.map((child) => ({
        slug: child.slug,
        label: child.label,
        productCount: counts.get(child.id) ?? 0,
      })),
    };
  }

  async executeOrThrow(slug: string): Promise<PublicCategoryDetail> {
    const result = await this.execute(slug);
    if (!result) {
      throw new EntityNotFoundError('Category', slug);
    }
    return result;
  }
}
