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
  DynamicProductGridFormFields,
  RichTextFormFields,
  SpacerFormFields,
  UnsupportedBlockForm,
  type BlockFormValues,
} from '@/components/cms/forms/BlockPropsForm';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import {
  createPageBlockClient,
  listCategoriesClient,
  updatePageBlockClient,
} from '@/lib/api/cms-pages-client';

type BlockPropsDialogProps = {
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

export function BlockPropsDialog({
  slug,
  block,
  mode,
  insertAt,
  open,
  onOpenChange,
  onSaved,
}: BlockPropsDialogProps): React.JSX.Element | null {
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

    let parsedValues: BlockFormValues;
    try {
      parsedValues = schema.parse(values);
    } catch (validationError) {
      setIsSaving(false);
      if (validationError instanceof ZodError) {
        setError(validationError.errors[0]?.message ?? 'Dados inválidos');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cms-dialog-accent max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-[var(--admin-navy-deep)]">
            <span className="cms-type-picker-icon">
              <TypeIcon className="h-4 w-4" aria-hidden />
            </span>
            {BLOCK_TYPE_LABELS[block.type]}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Defina as propriedades iniciais do novo bloco antes de publicar na vitrine.'
              : 'Altere as propriedades salvas. A ordem na página permanece até você salvar a ordem.'}
          </DialogDescription>
        </DialogHeader>

        {isEditable ? (
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                void form.handleSubmit(handleSubmit)(event);
              }}
            >
              {block.type === BlockType.DYNAMIC_PRODUCT_GRID && (
                <DynamicProductGridFormFields control={form.control} categories={categories} />
              )}
              {block.type === BlockType.SPACER && <SpacerFormFields control={form.control} />}
              {block.type === BlockType.BANNER && <BannerFormFields control={form.control} />}
              {block.type === BlockType.RICH_TEXT && <RichTextFormFields control={form.control} />}

              {error && (
                <div className="cms-status-banner is-error" role="alert">
                  {error}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Salvando…' : 'Salvar propriedades'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <UnsupportedBlockForm props={block.props} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
