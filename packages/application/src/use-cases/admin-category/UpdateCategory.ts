import {
  ConflictError,
  EntityNotFoundError,
  ValidationError,
  type CategoryRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { UpdateCategoryBody } from '@ecommerce-amazon/shared/admin';

import {
  assertCategoryDepthAllowed,
  assertCategoryNotDescendantOf,
  assertUniqueCategorySlug,
} from '../category/category.helpers.js';

export class UpdateCategory {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateCategoryBody): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new EntityNotFoundError('Category', id);
    }

    const previousSlug = category.slug;

    if (input.slug !== undefined && input.slug !== category.slug) {
      await assertUniqueCategorySlug(this.categoryRepository, input.slug, id);
      category.slug = input.slug;
    }

    if (input.parentId !== undefined) {
      const nextParentId = input.parentId ?? undefined;
      if (nextParentId) {
        const parent = await this.categoryRepository.findById(nextParentId);
        if (!parent) {
          throw new ValidationError('Parent category not found');
        }
        await assertCategoryNotDescendantOf(this.categoryRepository, id, nextParentId);
        await assertCategoryDepthAllowed(this.categoryRepository, nextParentId);
      }
      category.parentId = nextParentId;
    }

    if (input.label !== undefined) category.label = input.label.trim();
    if (input.icon !== undefined) category.icon = input.icon;
    if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder;
    if (input.seoTitle !== undefined) category.seoTitle = input.seoTitle;
    if (input.seoDescription !== undefined) category.seoDescription = input.seoDescription;
    if (input.descriptionHtml !== undefined) category.descriptionHtml = input.descriptionHtml;
    if (input.amazonBrowseNode !== undefined) category.amazonBrowseNode = input.amazonBrowseNode;
    if (input.mercadolivreCategoryId !== undefined) {
      category.mercadolivreCategoryId = input.mercadolivreCategoryId;
    }
    if (input.shopeeCategoryId !== undefined) category.shopeeCategoryId = input.shopeeCategoryId;
    if (input.visible !== undefined) category.visible = input.visible;

    category.updatedAt = new Date();
    await this.categoryRepository.save(category);

    const paths = [`/categorias/${category.slug}`, '/'];
    if (category.slug !== previousSlug) {
      paths.push(`/categorias/${previousSlug}`);
    }
    await this.webRevalidator.revalidate({
      paths: [...new Set(paths)],
      layoutPaths: ['/'],
    });
  }
}

export class DeleteCategory {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new EntityNotFoundError('Category', id);
    }

    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new ConflictError('Category has child categories');
    }

    const productCount = await this.categoryRepository.countDirectProducts(id);
    if (productCount > 0) {
      throw new ConflictError('Category has linked products');
    }

    await this.categoryRepository.delete(id);
    await this.webRevalidator.revalidate({
      paths: [`/categorias/${category.slug}`, '/'],
      layoutPaths: ['/'],
    });
  }
}

export class ReorderCategories {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(items: { id: string; sortOrder: number }[]): Promise<void> {
    await this.categoryRepository.reorder(items);
    await this.webRevalidator.revalidate({
      paths: ['/'],
      layoutPaths: ['/'],
    });
  }
}
