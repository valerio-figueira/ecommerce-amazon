import type { AutoLink } from '../entities/AutoLink.js';

export interface AutoLinkRepository {
  save(autoLink: AutoLink): Promise<void>;
  findById(id: string): Promise<AutoLink | null>;
  findByKeywordNormalized(keyword: string): Promise<AutoLink | null>;
  findAllActiveSortedByPriority(): Promise<AutoLink[]>;
  listPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ items: AutoLink[]; total: number }>;
  delete(id: string): Promise<void>;
}
