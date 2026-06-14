'use client';

import { useWatch, type Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import {
  BENTO_SLOT1_CONTENT_TYPE_OPTIONS,
  BENTO_SLOT3_CONTENT_TYPE_OPTIONS,
} from '@/components/cms/props-forms/bento-hub-mix-form-meta';
import type {
  AdminArticlePickerOption,
  AdminCollectionPickerOption,
  ProductPickerOption,
} from '@/lib/api/cms-pages-client';
import { cn } from '@/lib/utils';

type BentoHubMixPreviewProps = {
  control: Control<BlockFormValues>;
  collections: AdminCollectionPickerOption[];
  articles: AdminArticlePickerOption[];
  products: ProductPickerOption[];
  categories: Array<{ slug: string; label: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function BentoHubMixPreview({
  control,
  collections,
  articles,
  products,
  categories,
}: BentoHubMixPreviewProps): React.JSX.Element {
  const slot1 = useWatch({ control, name: 'slot1' });
  const slot2 = useWatch({ control, name: 'slot2' });
  const slot3 = useWatch({ control, name: 'slot3' });

  const slot1Record = readRecord(slot1);
  const slot2Record = readRecord(slot2);
  const slot3Record = readRecord(slot3);

  const slot1Type = readString(slot1Record['contentType']) || 'collection';
  const slot1EntityId = readString(slot1Record['entityId']);
  const slot1Title = readString(slot1Record['title']);
  const slot1Cover = readString(slot1Record['coverImageUrl']);

  const slot2ProductId = readString(slot2Record['productId']);

  const slot3Type = readString(slot3Record['contentType']) || 'category';
  const slot3CategorySlug = readString(slot3Record['categorySlug']);
  const slot3ProductIds = Array.isArray(slot3Record['productIds'])
    ? slot3Record['productIds'].filter((id): id is string => typeof id === 'string')
    : [];

  const collection = collections.find((item) => item.id === slot1EntityId);
  const article = articles.find((item) => item.id === slot1EntityId);
  const offerProduct = products.find((item) => item.id === slot2ProductId);
  const categoryLabel = categories.find((item) => item.slug === slot3CategorySlug)?.label;
  const listProducts = slot3ProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is ProductPickerOption => product !== undefined);

  const heroTitle =
    slot1Title ||
    (slot1Type === 'collection' ? collection?.title : article?.title) ||
    'Destaque editorial';
  const heroCover =
    slot1Cover ||
    (slot1Type === 'collection' ? collection?.coverImageUrl : undefined) ||
    'https://placehold.co/800x600?text=Hub';

  const slot1Label =
    BENTO_SLOT1_CONTENT_TYPE_OPTIONS.find((option) => option.value === slot1Type)?.label ??
    'Destaque';
  const slot3Label =
    BENTO_SLOT3_CONTENT_TYPE_OPTIONS.find((option) => option.value === slot3Type)?.label ??
    'Lista';

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
      <div
        className={cn(
          'relative min-h-[7rem] overflow-hidden rounded-2xl border border-neutral-200 md:col-span-2 md:row-span-2 md:min-h-[9rem]',
        )}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.15)), url(${heroCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/80">
            {slot1Label}
          </span>
          <p className="line-clamp-2 text-sm font-bold text-white">{heroTitle}</p>
        </div>
      </div>

      <div className="min-h-[4.5rem] rounded-2xl border border-neutral-200 bg-white p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">Oferta</p>
        <p className="mt-1 line-clamp-2 text-xs font-semibold text-neutral-900">
          {offerProduct?.title ?? 'Selecione um produto'}
        </p>
      </div>

      <div className="min-h-[4.5rem] rounded-2xl border border-neutral-200 bg-white p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
          {slot3Label}
        </p>
        {slot3Type === 'category' ? (
          <p className="mt-1 text-xs font-semibold text-neutral-900">
            {categoryLabel ?? slot3CategorySlug ?? 'Categoria'}
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5">
            {listProducts.length > 0 ? (
              listProducts.map((product) => (
                <li key={product.id} className="line-clamp-1 text-[11px] text-neutral-700">
                  {product.title}
                </li>
              ))
            ) : (
              <li className="text-[11px] text-neutral-500">Selecione produtos</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
