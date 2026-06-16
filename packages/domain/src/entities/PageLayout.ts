import { PageKind, PageStatus } from '../enums/index.js';

export class PageLayout {
  constructor(
    readonly id: string,
    readonly slug: string,
    readonly title: string,
    readonly status: PageStatus,
    readonly pageKind: PageKind,
    readonly seoTitle: string | undefined,
    readonly seoDescription: string | undefined,
    readonly institutionalContent: Record<string, unknown> | undefined,
    readonly publishedAt: Date | undefined,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    slug: string;
    title: string;
    status: PageStatus;
    pageKind?: PageKind;
    seoTitle?: string | undefined;
    seoDescription?: string | undefined;
    institutionalContent?: Record<string, unknown> | undefined;
    publishedAt?: Date | undefined;
    updatedAt: Date;
  }): PageLayout {
    return new PageLayout(
      props.id,
      props.slug,
      props.title,
      props.status,
      props.pageKind ?? PageKind.BLOCK_LAYOUT,
      props.seoTitle,
      props.seoDescription,
      props.institutionalContent,
      props.publishedAt,
      props.updatedAt,
    );
  }
}
