import type { ContentCluster } from '../entities/ContentCluster.js';
import type { ArticleStatus } from '../enums/index.js';

export type ContentClusterAdminSummary = {
  id: string;
  name: string;
  slug: string;
  pilarTitle: string | null;
  memberCount: number;
  updatedAt: Date;
};

export type ContentClusterMemberSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  status: ArticleStatus;
  isPilar: boolean;
};

export type ContentClusterPublishedMember = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  isPilar: boolean;
};

export interface ContentClusterRepository {
  findById(id: string): Promise<ContentCluster | null>;
  findBySlug(slug: string): Promise<ContentCluster | null>;
  findByPilarArticleId(articleId: string): Promise<ContentCluster | null>;
  listAdminSummaries(): Promise<ContentClusterAdminSummary[]>;
  listPublishedMembers(clusterId: string): Promise<ContentClusterPublishedMember[]>;
  listAllMembers(clusterId: string): Promise<ContentClusterMemberSummary[]>;
  listMemberSlugs(clusterId: string): Promise<string[]>;
  countMembers(clusterId: string): Promise<number>;
  save(cluster: ContentCluster): Promise<void>;
  delete(id: string): Promise<void>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  setArticleClusterId(articleId: string, clusterId: string | null): Promise<void>;
}
