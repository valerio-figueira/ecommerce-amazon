import type { AutoLink } from '../entities/ContentArticle.js';

export interface AutoLinkRepository {
  listActive(): Promise<AutoLink[]>;
}
