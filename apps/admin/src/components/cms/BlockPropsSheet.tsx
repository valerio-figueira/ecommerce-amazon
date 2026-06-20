'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ZodError } from 'zod';

import { BLOCK_TYPE_LABELS, isEditableBlockType } from '@/components/cms/block-type-labels';
import { getBlockTypeMeta } from '@/components/cms/block-type-meta';
import {
  BannerFormFields,
  RichTextFormFields,
  SpacerFormFields,
  UnsupportedBlockForm,
  type BlockFormValues,
} from '@/components/cms/forms/BlockPropsForm';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { CategoryBentoGridForm } from '@/components/cms/props-forms/CategoryBentoGridForm';
import { CategoryPillsForm } from '@/components/cms/props-forms/CategoryPillsForm';
import { CuratedCollectionForm } from '@/components/cms/props-forms/CuratedCollectionForm';
import { DynamicGridForm } from '@/components/cms/props-forms/DynamicGridForm';
import { BentoHubMixForm } from '@/components/cms/props-forms/BentoHubMixForm';
import { FeaturedProductForm } from '@/components/cms/props-forms/FeaturedProductForm';
import { HeroCarouselForm } from '@/components/cms/props-forms/HeroCarouselForm';
import { ProductGridForm } from '@/components/cms/props-forms/ProductGridForm';
import { WeeklyTrendsForm } from '@/components/cms/props-forms/WeeklyTrendsForm';
import {
  getSchemaForBlockType,
  normalizeFormValues,
  sanitizeFormValues,
} from '@/components/cms/props-forms/block-form-registry';
import { translateZodError } from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { Button } from '@/components/ui/button';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  createPageBlockClient,
  listAdminArticlesClient,
  listAdminCollectionsClient,
  listCategoriesClient,
  listProductsClient,
  updatePageBlockClient,
  type AdminArticlePickerOption,
  type AdminCollectionPickerOption,
  type ProductPickerOption,
} from '@/lib/api/cms-pages-client';

type BlockPropsSheetProps = {
  slug: string;
  block: AdminBlock | null;
  mode: 'create' | 'edit';
  insertAt: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (block: AdminBlock) => void;
  pageBlocks?: AdminBlock[];
};

const CATEGORY_BLOCK_TYPES = new Set<BlockType>([
  BlockType.DYNAMIC_PRODUCT_GRID,
  BlockType.CATEGORY_PILLS,
  BlockType.CATEGORY_BENTO_GRID,
  BlockType.PRODUCT_GRID,
  BlockType.BENTO_HUB_MIX,
]);

const PRODUCT_BLOCK_TYPES = new Set<BlockType>([
  BlockType.HERO_CAROUSEL,
  BlockType.FEATURED_PRODUCT,
  BlockType.BENTO_HUB_MIX,
]);

const BENTO_HUB_MIX_BLOCK_TYPES = new Set<BlockType>([BlockType.BENTO_HUB_MIX]);

function BlockFormBody({
  block,
  control,
  categories,
  products,
  collections,
  articles,
  pageBlocks,
}: {
  block: AdminBlock;
  control: ReturnType<typeof useForm<BlockFormValues>>['control'];
  categories: Array<{ slug: string; label: string }>;
  products: ProductPickerOption[];
  collections: AdminCollectionPickerOption[];
  articles: AdminArticlePickerOption[];
  pageBlocks: AdminBlock[];
}): React.JSX.Element {
  switch (block.type) {
    case BlockType.HERO_CAROUSEL:
      return <HeroCarouselForm control={control} products={products} />;
    case BlockType.CATEGORY_PILLS:
      return (
        <CategoryPillsForm
          control={control}
          categories={categories}
          pageBlocks={pageBlocks}
          currentBlockId={block.id === 'draft' ? undefined : block.id}
        />
      );
    case BlockType.CATEGORY_BENTO_GRID:
      return <CategoryBentoGridForm control={control} categories={categories} />;
    case BlockType.PRODUCT_GRID:
      return <ProductGridForm control={control} categories={categories} />;
    case BlockType.FEATURED_PRODUCT:
      return <FeaturedProductForm control={control} products={products} />;
    case BlockType.CURATED_COLLECTION:
      return <CuratedCollectionForm control={control} />;
    case BlockType.DYNAMIC_PRODUCT_GRID:
      return <DynamicGridForm control={control} categories={categories} />;
    case BlockType.WEEKLY_TRENDS:
      return <WeeklyTrendsForm control={control} />;
    case BlockType.BENTO_HUB_MIX:
      return (
        <BentoHubMixForm
          control={control}
          collections={collections}
          articles={articles}
          products={products}
          categories={categories}
        />
      );
    case BlockType.SPACER:
      return <SpacerFormFields control={control} />;
    case BlockType.BANNER:
      return <BannerFormFields control={control} />;
    case BlockType.RICH_TEXT:
      return <RichTextFormFields control={control} />;
    default:
      return <UnsupportedBlockForm blockTypeLabel={BLOCK_TYPE_LABELS[block.type]} />;
  }
}

export function BlockPropsSheet({
  slug,
  block,
  mode,
  insertAt,
  open,
  onOpenChange,
  onSaved,
  pageBlocks = [],
}: BlockPropsSheetProps): React.JSX.Element | null {
  const isEditable = block ? isEditableBlockType(block.type) : false;

  const schema = useMemo(
    () => (block ? getSchemaForBlockType(block.type) : getSchemaForBlockType(BlockType.SPACER)),
    [block],
  );

  const adminToast = useAdminToast();
  const form = useForm<BlockFormValues>({
    defaultValues: block ? normalizeFormValues(block.type, block.props) : {},
  });

  const [categories, setCategories] = useState<Array<{ slug: string; label: string }>>([]);
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [collections, setCollections] = useState<AdminCollectionPickerOption[]>([]);
  const [articles, setArticles] = useState<AdminArticlePickerOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (block && open) {
      form.reset(normalizeFormValues(block.type, block.props));
    }
  }, [block, form, open]);

  useEffect(() => {
    if (!open || !block) return;
    if (CATEGORY_BLOCK_TYPES.has(block.type)) {
      void listCategoriesClient().then(setCategories);
    }
    if (PRODUCT_BLOCK_TYPES.has(block.type)) {
      void listProductsClient({ pageSize: 50 }).then(setProducts);
    }
    if (BENTO_HUB_MIX_BLOCK_TYPES.has(block.type)) {
      void listAdminCollectionsClient()
        .then(setCollections)
        .catch(() => setCollections([]));
      void listAdminArticlesClient()
        .then(setArticles)
        .catch(() => setArticles([]));
    }
  }, [block, open]);

  if (!block) return null;

  const meta = getBlockTypeMeta(block.type);
  const TypeIcon = meta.icon;

  async function handleSubmit(values: BlockFormValues): Promise<void> {
    if (!block) return;
    setIsSaving(true);

    const sanitized = sanitizeFormValues(block.type, values);

    let parsedValues: BlockFormValues;
    try {
      parsedValues = schema.parse(sanitized);
    } catch (validationError) {
      setIsSaving(false);
      if (validationError instanceof ZodError) {
        const first = validationError.errors[0];
        const message = first
          ? translateZodError(first.message, first.path.map(String))
          : 'Dados inválidos';
        adminToast.error(message);
      } else {
        adminToast.error('Dados inválidos');
      }
      return;
    }

    try {
      if (mode === 'create') {
        const created = await createPageBlockClient(slug, {
          type: block.type,
          position: insertAt ?? 0,
          props: parsedValues,
          visibility: block.visibility,
        });
        onSaved({ ...created, position: created.sortOrder });
      } else {
        const updated = await updatePageBlockClient(slug, block.id, {
          type: block.type,
          position: block.position,
          props: parsedValues,
          visibility: block.visibility,
        });
        onSaved({ ...updated, position: updated.sortOrder });
      }
      onOpenChange(false);
    } catch (submitError) {
      adminToast.error(submitError instanceof Error ? submitError.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  }

  const saveLabel =
    block.type === BlockType.DYNAMIC_PRODUCT_GRID ||
    block.type === BlockType.HERO_CAROUSEL ||
    block.type === BlockType.CATEGORY_PILLS ||
    block.type === BlockType.CATEGORY_BENTO_GRID ||
    block.type === BlockType.PRODUCT_GRID ||
    block.type === BlockType.FEATURED_PRODUCT ||
    block.type === BlockType.BENTO_HUB_MIX
      ? 'Aplicar configurações no bloco'
      : 'Salvar propriedades';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={`cms-props-sheet flex w-full flex-col p-0 ${
          block.type === BlockType.BENTO_HUB_MIX ? 'sm:max-w-xl' : 'sm:max-w-lg'
        }`}
      >
        <SheetHeader className="shrink-0 border-b border-[var(--admin-gray)] px-6 py-5">
          <SheetTitle className="flex items-center gap-2.5">
            <span className="cms-type-picker-icon">
              <TypeIcon className="h-4 w-4" aria-hidden />
            </span>
            {BLOCK_TYPE_LABELS[block.type]}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Defina as propriedades iniciais do novo bloco antes de publicar na vitrine.'
              : 'Altere as propriedades salvas. A ordem na página permanece até você salvar a ordem.'}
          </SheetDescription>
        </SheetHeader>

        {isEditable ? (
          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                void form.handleSubmit(handleSubmit)(event);
              }}
            >
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <BlockFormBody
                  block={block}
                  control={form.control}
                  categories={categories}
                  products={products}
                  collections={collections}
                  articles={articles}
                  pageBlocks={pageBlocks}
                />
              </div>

              <SheetFooter className="shrink-0 flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Salvando…' : saveLabel}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <UnsupportedBlockForm blockTypeLabel={BLOCK_TYPE_LABELS[block.type]} />
            </div>
            <SheetFooter className="shrink-0 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
