import {
  parseInternalLinkTargetUrl as parseSharedInternalLinkTargetUrl,
  type InternalLinkTargetType,
} from '@ecommerce-amazon/shared/admin';
import {
  describeExternalAutoLinkTarget,
  isExternalAutoLinkTargetUrl,
} from '@ecommerce-amazon/shared/seo';

export type { InternalLinkTargetType };

export type InternalLinkTarget = {
  type: InternalLinkTargetType;
  label: string;
  slug: string;
  targetUrl: string;
  meta?: string;
};

export type InternalLinkTargetGroup = {
  type: InternalLinkTargetType;
  groupLabel: string;
  items: InternalLinkTarget[];
};

export type ResolvedInternalLinkLabel = {
  label: string;
  typeLabel: string;
  type: InternalLinkTargetType;
};

const TYPE_LABELS: Record<InternalLinkTargetType, string> = {
  product: 'Produto',
  product_category: 'Categoria',
  collection: 'Coleção',
  article: 'Artigo',
  article_category: 'Categoria editorial',
};

const GROUP_LABELS: Record<InternalLinkTargetType, string> = {
  product: 'Produtos',
  product_category: 'Categorias',
  collection: 'Coleções',
  article: 'Artigos',
  article_category: 'Categorias editoriais',
};

const TYPE_ORDER: InternalLinkTargetType[] = [
  'product',
  'product_category',
  'collection',
  'article',
  'article_category',
];

export function getInternalLinkTypeLabel(type: InternalLinkTargetType): string {
  return TYPE_LABELS[type];
}

export function getInternalLinkGroupLabel(type: InternalLinkTargetType): string {
  return GROUP_LABELS[type];
}

export function parseInternalLinkTargetUrl(
  url: string,
): { type: InternalLinkTargetType; slug: string } | null {
  return parseSharedInternalLinkTargetUrl(url);
}

export function isManualTargetUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (isExternalAutoLinkTargetUrl(trimmed)) {
    return true;
  }
  return parseInternalLinkTargetUrl(trimmed) === null;
}

export function resolveManualTargetLabel(targetUrl: string): string | null {
  return describeExternalAutoLinkTarget(targetUrl);
}

export function groupInternalLinkTargets(targets: InternalLinkTarget[]): InternalLinkTargetGroup[] {
  return TYPE_ORDER.map((type) => ({
    type,
    groupLabel: GROUP_LABELS[type],
    items: targets.filter((target) => target.type === type),
  })).filter((group) => group.items.length > 0);
}

export function resolveInternalLinkLabel(
  targetUrl: string,
  targets: InternalLinkTarget[],
): ResolvedInternalLinkLabel | null {
  const trimmed = targetUrl.trim();
  const match = targets.find((target) => target.targetUrl === trimmed);
  if (match) {
    return {
      label: match.label,
      typeLabel: TYPE_LABELS[match.type],
      type: match.type,
    };
  }

  const parsed = parseInternalLinkTargetUrl(trimmed);
  if (!parsed) {
    return null;
  }

  return {
    label: parsed.slug,
    typeLabel: TYPE_LABELS[parsed.type],
    type: parsed.type,
  };
}

export function findInternalLinkTargetByUrl(
  targetUrl: string,
  targets: InternalLinkTarget[],
): InternalLinkTarget | null {
  const trimmed = targetUrl.trim();
  return targets.find((target) => target.targetUrl === trimmed) ?? null;
}
