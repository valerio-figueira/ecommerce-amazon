import { ValidationError } from '../errors/DomainError.js';
import { Slug, toSlug } from '../value-objects/index.js';

const NAME_MAX_LENGTH = 120;
const SLUG_MAX_LENGTH = 150;

export class ContentCluster {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: Slug,
    readonly description: string | null,
    readonly pilarArticleId: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    pilarArticleId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ContentCluster {
    const name = props.name.trim();
    if (name.length === 0 || name.length > NAME_MAX_LENGTH) {
      throw new ValidationError('Cluster name must be between 1 and 120 characters');
    }

    const slugValue = toSlug(props.slug);
    if (slugValue.length === 0 || slugValue.length > SLUG_MAX_LENGTH) {
      throw new ValidationError('Cluster slug must be between 1 and 150 characters');
    }

    const now = new Date();
    return new ContentCluster(
      props.id,
      name,
      slugValue,
      props.description?.trim() || null,
      props.pilarArticleId ?? null,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  withUpdates(
    updates: Partial<{
      name: string;
      slug: string;
      description: string | null;
      pilarArticleId: string | null;
    }>,
  ): ContentCluster {
    return ContentCluster.create({
      id: this.id,
      name: updates.name ?? this.name,
      slug: updates.slug ?? this.slug,
      description: updates.description !== undefined ? updates.description : this.description,
      pilarArticleId:
        updates.pilarArticleId !== undefined ? updates.pilarArticleId : this.pilarArticleId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
