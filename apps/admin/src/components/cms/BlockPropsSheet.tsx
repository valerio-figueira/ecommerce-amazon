'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import {
  bannerPropsSchema,
  dynamicProductGridPropsSchema,
  richTextPropsSchema,
  spacerPropsSchema,
} from '@ecommerce-amazon/shared/cms';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ZodError, type z } from 'zod';

import {
  BLOCK_TYPE_LABELS,
  EDITABLE_BLOCK_TYPES,
} from '@/components/cms/block-type-labels';
import { getBlockTypeMeta } from '@/components/cms/block-type-meta';
import {
  BannerFormFields,
  RichTextFormFields,
  SpacerFormFields,
  UnsupportedBlockForm,
  type BlockFormValues,
} from '@/components/cms/forms/BlockPropsForm';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { translateZodError } from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { DynamicGridForm } from '@/components/cms/props-forms/DynamicGridForm';
import { Button } from '@/components/ui/button';
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
  listCategoriesClient,
  updatePageBlockClient,
} from '@/lib/api/cms-pages-client';
import { cn } from '@/lib/utils';

type BlockPropsSheetProps = {
  slug: string;
  block: AdminBlock | null;
  mode: 'create' | 'edit';
  insertAt: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (block: AdminBlock) => void;
};

function getSchemaForType(type: BlockType): z.ZodType<BlockFormValues> {
  switch (type) {
    case BlockType.DYNAMIC_PRODUCT_GRID:
      return dynamicProductGridPropsSchema;
    case BlockType.SPACER:
      return spacerPropsSchema;
    case BlockType.BANNER:
      return bannerPropsSchema;
    case BlockType.RICH_TEXT:
      return richTextPropsSchema;
    default:
      return spacerPropsSchema;
  }
}

function toFormValues(props: unknown): BlockFormValues {
  if (typeof props === 'object' && props !== null) {
    return { ...props };
  }
  return {};
}

function sanitizeFormValues(values: BlockFormValues): BlockFormValues {
  const next = { ...values };
  if (next['minDiscountPercentage'] === 0 || next['minDiscountPercentage'] === undefined) {
    delete next['minDiscountPercentage'];
  }
  if (next['subtitle'] === '') {
    delete next['subtitle'];
  }
  return next;
}

export function BlockPropsSheet({
  slug,
  block,
  mode,
  insertAt,
  open,
  onOpenChange,
  onSaved,
}: BlockPropsSheetProps): React.JSX.Element | null {
  const isEditable = block ? EDITABLE_BLOCK_TYPES.includes(block.type) : false;

  const schema = useMemo(
    () => (block ? getSchemaForType(block.type) : spacerPropsSchema),
    [block],
  );

  const form = useForm<BlockFormValues>({
    defaultValues: toFormValues(block?.props),
  });

  const [categories, setCategories] = useState<Array<{ slug: string; label: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (block && open) {
      form.reset(toFormValues(block.props));
      setError(null);
    }
  }, [block, form, open]);

  useEffect(() => {
    if (open && block?.type === BlockType.DYNAMIC_PRODUCT_GRID) {
      void listCategoriesClient().then(setCategories);
    }
  }, [block?.type, open]);

  if (!block) return null;

  const meta = getBlockTypeMeta(block.type);
  const TypeIcon = meta.icon;

  async function handleSubmit(values: BlockFormValues): Promise<void> {
    if (!block) return;
    setIsSaving(true);
    setError(null);

    const sanitized = sanitizeFormValues(values);

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
        setError(message);
      } else {
        setError('Dados inválidos');
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
      setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  }

  const saveLabel =
    block.type === BlockType.DYNAMIC_PRODUCT_GRID
      ? 'Aplicar configurações no bloco'
      : 'Salvar propriedades';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="cms-props-sheet flex w-full flex-col p-0 sm:max-w-lg">
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
                {block.type === BlockType.DYNAMIC_PRODUCT_GRID && (
                  <DynamicGridForm control={form.control} categories={categories} />
                )}
                {block.type === BlockType.SPACER && <SpacerFormFields control={form.control} />}
                {block.type === BlockType.BANNER && <BannerFormFields control={form.control} />}
                {block.type === BlockType.RICH_TEXT && <RichTextFormFields control={form.control} />}
              </div>

              <SheetFooter className="shrink-0 flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                {error && (
                  <div className={cn('cms-status-banner is-error w-full sm:order-first sm:mr-auto sm:max-w-[60%]')} role="alert">
                    {error}
                  </div>
                )}
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
              <UnsupportedBlockForm props={block.props} />
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