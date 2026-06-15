'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminCategoryOptions } from '@/hooks/useAdminCategoryOptions';
import { buildCategorySlugChain } from '@/lib/api/categories-utils';
import type { ProductFormValues } from '@/lib/product-form-values';
import { resolveSpecTemplateForSlugChain } from '@ecommerce-amazon/shared/product/spec-templates';

type CustomSpecRow = {
  id: string;
  key: string;
  value: string;
};

function createCustomRow(key = '', value = ''): CustomSpecRow {
  return {
    id: `${key || 'draft'}-${Math.random().toString(36).slice(2, 9)}`,
    key,
    value,
  };
}

export function ProductSpecsForm(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const categoryOptions = useAdminCategoryOptions();
  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const specsNormalized = useWatch({ control: form.control, name: 'specsNormalized' }) ?? {};

  const slugChain = useMemo(
    () => buildCategorySlugChain(categoryId, categoryOptions),
    [categoryId, categoryOptions],
  );
  const templateKeys = useMemo(() => resolveSpecTemplateForSlugChain(slugChain), [slugChain]);

  const customKeys = useMemo(
    () => Object.keys(specsNormalized).filter((key) => !templateKeys.includes(key)),
    [specsNormalized, templateKeys],
  );

  const [draftCustomRows, setDraftCustomRows] = useState<CustomSpecRow[]>([]);

  const visibleCustomRows = useMemo(() => {
    const persistedRows = customKeys.map((key) => ({
      id: `custom-${key}`,
      key,
      value: specsNormalized[key] ?? '',
      isDraft: false,
    }));
    const draftRows = draftCustomRows
      .filter((row) => !row.key.trim() || !customKeys.includes(row.key.trim()))
      .map((row) => ({ ...row, isDraft: true }));
    return [...persistedRows, ...draftRows];
  }, [customKeys, draftCustomRows, specsNormalized]);

  function setSpecs(next: Record<string, string>): void {
    form.setValue('specsNormalized', next, { shouldDirty: true, shouldValidate: true });
  }

  function updateTemplateValue(key: string, value: string): void {
    setSpecs({
      ...specsNormalized,
      [key]: value,
    });
  }

  function updateCustomRow(rowId: string, nextKey: string, nextValue: string): void {
    const row = visibleCustomRows.find((item) => item.id === rowId);
    if (!row) {
      return;
    }

    const previousKey = row.key.trim();
    const trimmedKey = nextKey.trim();

    if (row.isDraft && !trimmedKey) {
      setDraftCustomRows((current) =>
        current.map((item) =>
          item.id === rowId ? { ...item, key: nextKey, value: nextValue } : item,
        ),
      );
      return;
    }

    const next = { ...specsNormalized };

    if (previousKey && previousKey !== trimmedKey) {
      delete next[previousKey];
    }

    if (trimmedKey) {
      next[trimmedKey] = nextValue;
    }

    setSpecs(next);
    setDraftCustomRows((current) => current.filter((item) => item.id !== rowId));
  }

  function removeCustomRow(rowId: string): void {
    const row = visibleCustomRows.find((item) => item.id === rowId);
    if (row?.key.trim()) {
      const next = { ...specsNormalized };
      delete next[row.key.trim()];
      setSpecs(next);
    }

    setDraftCustomRows((current) => current.filter((item) => item.id !== rowId));
  }

  function addCustomRow(): void {
    setDraftCustomRows((current) => [...current, createCustomRow()]);
  }

  return (
    <CmsFormSection title="Especificações do Produto">
      {!categoryId ? (
        <p className="text-sm text-[var(--admin-text-muted)]">
          Selecione uma categoria para ver especificações sugeridas.
        </p>
      ) : null}

      {categoryId && templateKeys.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">
          Esta categoria não possui template padrão. Use atributos customizados abaixo.
        </p>
      ) : null}

      {templateKeys.length > 0 ? (
        <div className="space-y-3">
          {templateKeys.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`spec-template-${key}`}>{key}</Label>
              <Input
                id={`spec-template-${key}`}
                value={specsNormalized[key] ?? ''}
                onChange={(event) => updateTemplateValue(key, event.target.value)}
                placeholder={`Valor para ${key}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3 border-t border-[var(--admin-gray)] pt-4">
        <p className="text-sm font-medium text-[var(--admin-navy)]">Atributos customizados</p>

        {visibleCustomRows.length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)]">
            Nenhum atributo customizado. Use o botão abaixo para adicionar pares chave/valor
            extras.
          </p>
        ) : null}

        {visibleCustomRows.map((row) => (
          <div key={row.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              aria-label="Chave do atributo customizado"
              placeholder="Chave (ex: Garantia)"
              value={row.key}
              onChange={(event) => updateCustomRow(row.id, event.target.value, row.value)}
              className="sm:flex-1"
            />
            <Input
              aria-label="Valor do atributo customizado"
              placeholder="Valor (ex: 12 meses)"
              value={row.value}
              onChange={(event) => updateCustomRow(row.id, row.key, event.target.value)}
              className="sm:flex-[2]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeCustomRow(row.id)}
              aria-label="Remover atributo customizado"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="ghost" size="sm" onClick={addCustomRow}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar atributo customizado
        </Button>
      </div>
    </CmsFormSection>
  );
}
