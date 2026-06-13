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
    readonly body: string,
    readonly type: ArticleType,
    readonly status: ArticleStatus,
    readonly seo: {
      metaTitle?: string;
      metaDescription?: string;
      canonical?: string;
    },
    readonly embeds: ContentProductEmbed[],
    readonly publishedAt?: Date,
  ) {}

  static create(props: {
    id: string;
    slug: string;
    title: string;
    body: string;
    type: ArticleType;
    status: ArticleStatus;
    seo: ContentArticle['seo'];
    embeds: ContentProductEmbed[];
    publishedAt?: Date;
  }): ContentArticle {
    return new ContentArticle(
      props.id,
      toSlug(props.slug),
      props.title,
      props.body,
      props.type,
      props.status,
      props.seo,
      props.embeds,
      props.publishedAt,
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
