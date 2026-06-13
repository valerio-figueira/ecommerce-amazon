import { PageStatus } from '../enums/cms.js';

export class PageLayout {
  constructor(
    readonly id: string,
    readonly slug: string,
    readonly title: string,
    readonly status: PageStatus,
    readonly seoTitle: string | undefined,
    readonly seoDescription: string | undefined,
    readonly publishedAt: Date | undefined,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    slug: string;
    title: string;
    status: PageStatus;
    seoTitle?: string | undefined;
    seoDescription?: string | undefined;
    publishedAt?: Date | undefined;
    updatedAt: Date;
  }): PageLayout {
    return new PageLayout(
      props.id,
      props.slug,
      props.title,
      props.status,
      props.seoTitle,
      props.seoDescription,
      props.publishedAt,
      props.updatedAt,
    );
  }
}
