'use client';

import { Plus, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { ProductSpecBlockEditor } from '@/components/products/ProductSpecBlockEditor';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { Button } from '@/components/ui/button';
import { FieldHint } from '@/components/ui/field-hint';
import { useAdminCategoryOptions } from '@/hooks/useAdminCategoryOptions';
import { buildCategorySlugChain } from '@/lib/api/categories-utils';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';
import {
  buildSuggestedBlockFromTemplate,
  createEmptyBlock,
  hasSuggestedBlock,
  specsNormalizedToUiState,
  type SpecBlockState,
  uiStateToSpecsNormalized,
} from '@/lib/product-specs-form-state';
import { resolveSpecTemplateForSlugChain } from '@ecommerce-amazon/shared/product/spec-templates';

type ProductSpecsFormProps = {
  onRegisterSync?: (syncHandler: () => void) => void;
};

export function ProductSpecsForm({ onRegisterSync }: ProductSpecsFormProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const categoryOptions = useAdminCategoryOptions();
  const categoryId = form.watch('categoryId');

  const slugChain = useMemo(
    () => buildCategorySlugChain(categoryId, categoryOptions),
    [categoryId, categoryOptions],
  );
  const templateKeys = useMemo(() => resolveSpecTemplateForSlugChain(slugChain), [slugChain]);

  const [blocks, setBlocks] = useState<SpecBlockState[]>([]);
  const hydratedRef = useRef(false);

  const syncToForm = useCallback((): void => {
    form.setValue('specsNormalized', uiStateToSpecsNormalized(blocks), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [blocks, form]);

  useEffect(() => {
    onRegisterSync?.(syncToForm);
  }, [onRegisterSync, syncToForm]);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    const currentGroups = form.getValues('specsNormalized') ?? [];
    if (currentGroups.length === 0 && !hydratedRef.current) {
      hydratedRef.current = true;
      setBlocks([]);
      return;
    }

    setBlocks(specsNormalizedToUiState(currentGroups));
    hydratedRef.current = true;
  }, [form]);

  function updateBlocks(nextBlocks: SpecBlockState[]): void {
    setBlocks(nextBlocks);
  }

  function handleBlockChange(blockId: string, nextBlock: SpecBlockState): void {
    updateBlocks(blocks.map((block) => (block.id === blockId ? nextBlock : block)));
  }

  function handleRemoveBlock(blockId: string): void {
    updateBlocks(blocks.filter((block) => block.id !== blockId));
  }

  function handleMoveBlock(blockId: string, direction: -1 | 1): void {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) {
      return;
    }

    const next = [...blocks];
    const current = next[index];
    const target = next[targetIndex];
    if (!current || !target) {
      return;
    }

    next[index] = target;
    next[targetIndex] = current;
    updateBlocks(next);
    syncToForm();
  }

  function handleAddBlock(): void {
    updateBlocks([...blocks, createEmptyBlock('Novo bloco')]);
    syncToForm();
  }

  function handleAddSuggestedBlock(): void {
    const existingGroups = uiStateToSpecsNormalized(blocks);
    updateBlocks([
      ...blocks,
      buildSuggestedBlockFromTemplate(templateKeys, existingGroups),
    ]);
    syncToForm();
  }

  const showSuggestedBlockAction =
    Boolean(categoryId) && templateKeys.length > 0 && !hasSuggestedBlock(blocks);

  return (
    <CmsFormSection title="Especificações do Produto">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-[var(--admin-navy)]">Blocos de especificações</p>
        <FieldHint text={PRODUCT_FORM_HINTS.specsBlocks} />
      </div>

      {!categoryId ? (
        <p className="text-sm text-[var(--admin-text-muted)]">
          Selecione uma categoria para habilitar sugestões de blocos por template.
        </p>
      ) : null}

      {blocks.length === 0 ? (
        <p className="text-xs text-[var(--admin-text-muted)]">
          Nenhum bloco cadastrado. Adicione blocos para organizar a ficha técnica na vitrine.
        </p>
      ) : null}

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <ProductSpecBlockEditor
            key={block.id}
            block={block}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
            onBlockChange={handleBlockChange}
            onRemoveBlock={handleRemoveBlock}
            onMoveBlock={handleMoveBlock}
            onBlurSync={syncToForm}
            onStructuralChange={syncToForm}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleAddBlock}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar novo bloco
        </Button>

        {showSuggestedBlockAction ? (
          <Button type="button" variant="ghost" size="sm" onClick={handleAddSuggestedBlock}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Adicionar bloco sugerido da categoria
          </Button>
        ) : null}
      </div>
    </CmsFormSection>
  );
}
