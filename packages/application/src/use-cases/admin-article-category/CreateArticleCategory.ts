import { randomUUID } from 'node:crypto';

import {
  ArticleCategory,
  ConflictError,
  EntityNotFoundError,
  type ArticleCategoryRepository,
  type CacheStore,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type {
  CreateArticleCategoryBody,
  UpdateArticleCategoryBody,
} from '@ecommerce-amazon/shared/admin';

import {
  buildArticleCategoryPublicPaths,
  buildArticlePublicPaths,
  invalidateArticlePublicCache,
} from '../../cache/public-cache.helpers.js';
import { assertUniqueArticleCategorySlug } from './article-category.helpers.js';

export class CreateArticleCategory {
  constructor(private readonly articleCategoryRepository: ArticleCategoryRepository) {}

  async execute(input: CreateArticleCategoryBody): Promise<{ id: string }> {
    await assertUniqueArticleCategorySlug(this.articleCategoryRepository, input.slug);

    const now = new Date();
    const category = ArticleCategory.create({
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      createdAt: now,
      updatedAt: now,
    });

    await this.articleCategoryRepository.save(category);
    return { id: category.id };
  }
}

export class ListArticleCategories {
  constructor(private readonly articleCategoryRepository: ArticleCategoryRepository) {}

  async execute() {
    const categories = await this.articleCategoryRepository.listAll();
    return {
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
    };
  }
}

export class UpdateArticleCategory {
  constructor(
    private readonly articleCategoryRepository: ArticleCategoryRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateArticleCategoryBody): Promise<void> {
    const category = await this.articleCategoryRepository.findById(id);
    if (!category) {
      throw new EntityNotFoundError('ArticleCategory', id);
    }

    const previousSlug = category.slug;
    const linkedSlugs = await this.articleCategoryRepository.listLinkedArticleSlugs(id);

    const nextSlug = input.slug ?? category.slug;
    if (nextSlug !== category.slug) {
      await assertUniqueArticleCategorySlug(this.articleCategoryRepository, nextSlug, id);
    }

    const updated = ArticleCategory.create({
      id: category.id,
      name: input.name?.trim() ?? category.name,
      slug: nextSlug,
      createdAt: category.createdAt,
      updatedAt: new Date(),
    });

    await this.articleCategoryRepository.save(updated);
    await invalidateArticlePublicCache(this.cache, linkedSlugs);

    const categorySlugs = [...new Set([previousSlug, updated.slug])];
    await this.webRevalidator.revalidate({
      paths: [
        ...buildArticlePublicPaths(linkedSlugs, { includeListing: true }),
        ...buildArticleCategoryPublicPaths(categorySlugs),
      ],
    });
  }
}

export class DeleteArticleCategory {
  constructor(
    private readonly articleCategoryRepository: ArticleCategoryRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.articleCategoryRepository.findById(id);
    if (!category) {
      throw new EntityNotFoundError('ArticleCategory', id);
    }

    const linkedCount = await this.articleCategoryRepository.countLinkedArticles(id);
    if (linkedCount > 0) {
      throw new ConflictError('Article category has linked articles');
    }

    await this.articleCategoryRepository.delete(id);
    await this.webRevalidator.revalidate({
      paths: buildArticleCategoryPublicPaths([category.slug], { includeListing: true }),
    });
  }
}
