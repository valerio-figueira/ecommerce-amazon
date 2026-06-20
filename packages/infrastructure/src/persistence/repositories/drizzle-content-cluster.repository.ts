import { asc, and, count, eq, ne, sql } from 'drizzle-orm';

import {
  ArticleStatus,
  ContentCluster,
  parseArticleStatus,
  type ContentClusterRepository,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function mapContentCluster(row: typeof schema.contentClusters.$inferSelect): ContentCluster {
  return ContentCluster.create({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    pilarArticleId: row.pilarArticleId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleContentClusterRepository implements ContentClusterRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findById(id: string): Promise<ContentCluster | null> {
    const rows = await this.db
      .select()
      .from(schema.contentClusters)
      .where(eq(schema.contentClusters.id, id))
      .limit(1);

    const row = rows[0];
    return row ? mapContentCluster(row) : null;
  }

  async findBySlug(slug: string): Promise<ContentCluster | null> {
    const rows = await this.db
      .select()
      .from(schema.contentClusters)
      .where(eq(schema.contentClusters.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? mapContentCluster(row) : null;
  }

  async findByPilarArticleId(articleId: string): Promise<ContentCluster | null> {
    const rows = await this.db
      .select()
      .from(schema.contentClusters)
      .where(eq(schema.contentClusters.pilarArticleId, articleId))
      .limit(1);

    const row = rows[0];
    return row ? mapContentCluster(row) : null;
  }

  async listAdminSummaries() {
    const rows = await this.db
      .select({
        id: schema.contentClusters.id,
        name: schema.contentClusters.name,
        slug: schema.contentClusters.slug,
        pilarTitle: schema.contentArticles.title,
        updatedAt: schema.contentClusters.updatedAt,
      })
      .from(schema.contentClusters)
      .leftJoin(
        schema.contentArticles,
        eq(schema.contentClusters.pilarArticleId, schema.contentArticles.id),
      )
      .orderBy(asc(schema.contentClusters.name));

    const summaries = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        pilarTitle: row.pilarTitle,
        memberCount: await this.countMembers(row.id),
        updatedAt: row.updatedAt,
      })),
    );

    return summaries;
  }

  async listPublishedMembers(clusterId: string) {
    const rows = await this.db
      .select({
        id: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        excerpt: schema.contentArticles.excerpt,
        coverImageUrl: schema.contentArticles.coverImageUrl,
        publishedAt: schema.contentArticles.publishedAt,
        pilarArticleId: schema.contentClusters.pilarArticleId,
      })
      .from(schema.contentArticles)
      .innerJoin(
        schema.contentClusters,
        eq(schema.contentArticles.clusterId, schema.contentClusters.id),
      )
      .where(
        and(
          eq(schema.contentClusters.id, clusterId),
          eq(schema.contentArticles.status, ArticleStatus.PUBLISHED),
        ),
      )
      .orderBy(asc(schema.contentArticles.publishedAt));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageUrl,
      publishedAt: row.publishedAt,
      isPilar: row.pilarArticleId === row.id,
    }));
  }

  async listAllMembers(clusterId: string) {
    const clusterRows = await this.db
      .select({ pilarArticleId: schema.contentClusters.pilarArticleId })
      .from(schema.contentClusters)
      .where(eq(schema.contentClusters.id, clusterId))
      .limit(1);

    const pilarArticleId = clusterRows[0]?.pilarArticleId ?? null;

    const rows = await this.db
      .select({
        id: schema.contentArticles.id,
        slug: schema.contentArticles.slug,
        title: schema.contentArticles.title,
        excerpt: schema.contentArticles.excerpt,
        coverImageUrl: schema.contentArticles.coverImageUrl,
        publishedAt: schema.contentArticles.publishedAt,
        status: schema.contentArticles.status,
      })
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.clusterId, clusterId))
      .orderBy(asc(schema.contentArticles.publishedAt));

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.coverImageUrl,
      publishedAt: row.publishedAt,
      status: parseArticleStatus(row.status),
      isPilar: pilarArticleId === row.id,
    }));
  }

  async listMemberSlugs(clusterId: string): Promise<string[]> {
    const rows = await this.db
      .select({ slug: schema.contentArticles.slug })
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.clusterId, clusterId));

    return rows.map((row) => row.slug);
  }

  async countMembers(clusterId: string): Promise<number> {
    const rows = await this.db
      .select({ count: count() })
      .from(schema.contentArticles)
      .where(eq(schema.contentArticles.clusterId, clusterId));

    return Number(rows[0]?.count ?? 0);
  }

  async save(cluster: ContentCluster): Promise<void> {
    await this.db
      .insert(schema.contentClusters)
      .values({
        id: cluster.id,
        name: cluster.name,
        slug: cluster.slug,
        description: cluster.description,
        pilarArticleId: cluster.pilarArticleId,
        createdAt: cluster.createdAt,
        updatedAt: cluster.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.contentClusters.id,
        set: {
          name: cluster.name,
          slug: cluster.slug,
          description: cluster.description,
          pilarArticleId: cluster.pilarArticleId,
          updatedAt: cluster.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.contentClusters).where(eq(schema.contentClusters.id, id));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const condition = excludeId
      ? and(eq(schema.contentClusters.slug, slug), ne(schema.contentClusters.id, excludeId))
      : eq(schema.contentClusters.slug, slug);

    const rows = await this.db
      .select({ count: count() })
      .from(schema.contentClusters)
      .where(condition);

    return Number(rows[0]?.count ?? 0) > 0;
  }

  async setArticleClusterId(articleId: string, clusterId: string | null): Promise<void> {
    await this.db
      .update(schema.contentArticles)
      .set({
        clusterId,
        updatedAt: sql`now()`,
      })
      .where(eq(schema.contentArticles.id, articleId));
  }
}
