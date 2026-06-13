import type { Category } from '../entities/Category.js';

export type CategoryReorderItem = {
  id: string;
  sortOrder: number;
};

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  listAll(): Promise<Category[]>;
  listChildren(parentId: string | null): Promise<Category[]>;
  getDescendantIds(categoryId: string): Promise<string[]>;
  getAncestorChain(categoryId: string): Promise<Category[]>;
  countProductsInIds(categoryIds: string[], visibleOnly?: boolean): Promise<number>;
  countProductsByCategoryId(visibleOnly?: boolean): Promise<Map<string, number>>;
  hasChildren(categoryId: string): Promise<boolean>;
  countDirectProducts(categoryId: string): Promise<number>;
  save(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(items: CategoryReorderItem[]): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
