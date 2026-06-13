import type { CuratedCollection } from '../entities/ContentArticle.js';

export type CuratedCollectionSummary = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  productCount: number;
  updatedAt: Date;
};

export interface CuratedCollectionRepository {
  listAll(): Promise<CuratedCollectionSummary[]>;
  findById(id: string): Promise<CuratedCollection | null>;
  findBySlug(slug: string): Promise<CuratedCollection | null>;
  save(collection: CuratedCollection): Promise<void>;
  delete(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
