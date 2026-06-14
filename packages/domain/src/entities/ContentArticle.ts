import { ArticleStatus, ArticleType } from '../enums/index.js';
import { Slug, toSlug } from '../value-objects/index.js';

export type ContentProductEmbed = {
  productId: string;
  position: number;
  variant: 'inline' | 'highlight' | 'comparison';
};

export class ContentArticle {
  constructor(
    readonly id: string,
    readonly slug: Slug,
    readonly title: string,
    readonly excerpt: string,
    readonly coverImageUrl: string | null,
    readonly body: string,
    readonly type: ArticleType,
    readonly status: ArticleStatus,
    readonly authorId: string | null,
    readonly categoryId: string | null,
    readonly seoTitle: string | null,
    readonly seoDescription: string | null,
    readonly seo: {
      metaTitle?: string;
      metaDescription?: string;
      canonical?: string;
    },
    readonly embeds: ContentProductEmbed[],
    readonly publishedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    coverImageUrl?: string | null;
    body: string;
    type: ArticleType;
    status: ArticleStatus;
    authorId?: string | null;
    categoryId?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seo?: ContentArticle['seo'];
    embeds: ContentProductEmbed[];
    publishedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ContentArticle {
    const now = new Date();
    return new ContentArticle(
      props.id,
      toSlug(props.slug),
      props.title,
      props.excerpt ?? '',
      props.coverImageUrl ?? null,
      props.body,
      props.type,
      props.status,
      props.authorId ?? null,
      props.categoryId ?? null,
      props.seoTitle ?? null,
      props.seoDescription ?? null,
      props.seo ?? {},
      props.embeds,
      props.publishedAt ?? null,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }
}

export class CuratedCollection {
  constructor(
    readonly id: string,
    readonly slug: Slug,
    readonly title: string,
    readonly description: string,
    readonly coverImageUrl: string,
    readonly campaignOrigin: string,
    readonly utmDefaults: Record<string, string>,
    readonly productIds: string[],
    readonly ctaText: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImageUrl: string;
    campaignOrigin: string;
    utmDefaults: Record<string, string>;
    productIds: string[];
    ctaText: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): CuratedCollection {
    const now = new Date();
    return new CuratedCollection(
      props.id,
      toSlug(props.slug),
      props.title,
      props.description,
      props.coverImageUrl,
      props.campaignOrigin,
      props.utmDefaults,
      props.productIds,
      props.ctaText,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }
}