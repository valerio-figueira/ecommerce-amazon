import { DomainError } from '../errors/DomainError.js';

export const MAX_CATEGORY_DEPTH = 4;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CategoryProps = {
  id: string;
  slug: string;
  label: string;
  icon?: string | undefined;
  parentId?: string | undefined;
  sortOrder: number;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  descriptionHtml?: string | undefined;
  amazonBrowseNode?: string | undefined;
  mercadolivreCategoryId?: string | undefined;
  shopeeCategoryId?: string | undefined;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Category {
  readonly id: string;
  slug: string;
  label: string;
  icon?: string | undefined;
  parentId?: string | undefined;
  sortOrder: number;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  descriptionHtml?: string | undefined;
  amazonBrowseNode?: string | undefined;
  mercadolivreCategoryId?: string | undefined;
  shopeeCategoryId?: string | undefined;
  visible: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(props: CategoryProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.label = props.label;
    this.icon = props.icon;
    this.parentId = props.parentId;
    this.sortOrder = props.sortOrder;
    this.seoTitle = props.seoTitle;
    this.seoDescription = props.seoDescription;
    this.descriptionHtml = props.descriptionHtml;
    this.amazonBrowseNode = props.amazonBrowseNode;
    this.mercadolivreCategoryId = props.mercadolivreCategoryId;
    this.shopeeCategoryId = props.shopeeCategoryId;
    this.visible = props.visible;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CategoryProps): Category {
    Category.assertValidSlug(props.slug);
    if (!props.label.trim()) {
      throw new DomainError('Category label is required', 'INVALID_CATEGORY_LABEL');
    }
    return new Category(props);
  }

  static assertValidSlug(slug: string): void {
    if (!SLUG_PATTERN.test(slug)) {
      throw new DomainError(
        'Category slug must be kebab-case lowercase alphanumeric',
        'INVALID_CATEGORY_SLUG',
      );
    }
  }
}
