import { Slug, toSlug } from '../value-objects/index.js';

export class ArticleCategory {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: Slug,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    slug: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): ArticleCategory {
    const now = new Date();
    return new ArticleCategory(
      props.id,
      props.name.trim(),
      toSlug(props.slug),
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }
}
