'use client';

import {
  buildCascadePath,
  isStoredCategoryIdValidLeaf,
  resolveLeafCategoryId,
} from '@ecommerce-amazon/shared/category/resolve-cascade-category-id';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type UseFormReturn, useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldHint } from '@/components/ui/field-hint';
import type { CategoryFlatOption } from '@/lib/api/categories';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';

const NONE_VALUE = '__none__';

type CategoryCascadeSelectProps = {
  options: CategoryFlatOption[];
};

export function CategoryCascadeSelect({ options }: CategoryCascadeSelectProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const categoryId = form.watch('categoryId');
  const level1 = form.watch('categoryCascadeLevel1');
  const level2 = form.watch('categoryCascadeLevel2');
  const level3 = form.watch('categoryCascadeLevel3');
  const level4 = form.watch('categoryCascadeLevel4');
  const hydratedCategoryIdRef = useRef<string | undefined>(undefined);
  const [needsLeafReselection, setNeedsLeafReselection] = useState(false);

  const roots = useMemo(
    () => options.filter((option) => option.depth === 0),
    [options],
  );

  const level2Options = useMemo(
    () => (level1 ? options.filter((option) => option.parentId === level1) : []),
    [level1, options],
  );

  const level3Options = useMemo(
    () => (level2 ? options.filter((option) => option.parentId === level2) : []),
    [level2, options],
  );

  const level4Options = useMemo(
    () => (level3 ? options.filter((option) => option.parentId === level3) : []),
    [level3, options],
  );

  const storedCategoryInvalid = needsLeafReselection;

  useEffect(() => {
    if (!categoryId || options.length === 0) {
      return;
    }

    if (hydratedCategoryIdRef.current === categoryId) {
      return;
    }

    const path = buildCascadePath(categoryId, options);
    setCascadeLevels(form, path);
    hydratedCategoryIdRef.current = categoryId;

    if (!isStoredCategoryIdValidLeaf(categoryId, options)) {
      setNeedsLeafReselection(true);
      form.setValue('categoryId', undefined, { shouldDirty: true, shouldValidate: true });
    }
  }, [categoryId, form, options]);

  function syncCategoryFromCascade(levels: {
    level1?: string | undefined;
    level2?: string | undefined;
    level3?: string | undefined;
    level4?: string | undefined;
  }): void {
    const resolvedId = resolveLeafCategoryId(levels, options);
    form.setValue('categoryId', resolvedId, { shouldDirty: true, shouldValidate: true });
    hydratedCategoryIdRef.current = resolvedId;
    if (resolvedId) {
      setNeedsLeafReselection(false);
    }
  }

  function handleLevel1Change(value: string) {
    if (value === NONE_VALUE) {
      setCascadeLevels(form, {});
      syncCategoryFromCascade({});
      return;
    }

    const levels = { level1: value };
    setCascadeLevels(form, levels);
    syncCategoryFromCascade(levels);
  }

  function handleLevel2Change(value: string) {
    if (value === NONE_VALUE) {
      const levels = { level1 };
      setCascadeLevels(form, levels);
      syncCategoryFromCascade(levels);
      return;
    }

    const levels = { level1, level2: value };
    setCascadeLevels(form, levels);
    syncCategoryFromCascade(levels);
  }

  function handleLevel3Change(value: string) {
    if (value === NONE_VALUE) {
      const levels = { level1, level2 };
      setCascadeLevels(form, levels);
      syncCategoryFromCascade(levels);
      return;
    }

    const levels = { level1, level2, level3: value };
    setCascadeLevels(form, levels);
    syncCategoryFromCascade(levels);
  }

  function handleLevel4Change(value: string) {
    if (value === NONE_VALUE) {
      const levels = { level1, level2, level3 };
      setCascadeLevels(form, levels);
      syncCategoryFromCascade(levels);
      return;
    }

    const levels = { level1, level2, level3, level4: value };
    setCascadeLevels(form, levels);
    syncCategoryFromCascade(levels);
  }

  return (
    <FormField
      control={form.control}
      name="categoryId"
      render={() => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Categoria</FormLabel>
            <FieldHint text={PRODUCT_FORM_HINTS.category} />
          </div>
          <div className="grid gap-3 sm:max-w-md">
            <Select value={level1 ?? NONE_VALUE} onValueChange={handleLevel1Change}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Nível 1" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nenhuma</SelectItem>
                {roots.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {level1 && level2Options.length > 0 && (
              <Select value={level2 ?? NONE_VALUE} onValueChange={handleLevel2Change}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível 2" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Selecione...</SelectItem>
                  {level2Options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {level2 && level3Options.length > 0 && (
              <Select value={level3 ?? NONE_VALUE} onValueChange={handleLevel3Change}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível 3" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Selecione...</SelectItem>
                  {level3Options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {level3 && level4Options.length > 0 && (
              <Select value={level4 ?? NONE_VALUE} onValueChange={handleLevel4Change}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível 4" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Selecione...</SelectItem>
                  {level4Options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {storedCategoryInvalid && (
            <p className="text-sm text-amber-700" role="status">
              A categoria atual não é uma folha válida. Selecione a subcategoria mais específica.
            </p>
          )}
          <FormDescription>
            Selecione a subcategoria mais específica. Produtos devem ficar em categorias folha quando
            houver filhos.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function setCascadeLevels(
  form: UseFormReturn<ProductFormValues>,
  levels: {
    level1?: string | undefined;
    level2?: string | undefined;
    level3?: string | undefined;
    level4?: string | undefined;
  },
): void {
  const setOptions = { shouldDirty: true, shouldValidate: true } as const;
  form.setValue('categoryCascadeLevel1', levels.level1, setOptions);
  form.setValue('categoryCascadeLevel2', levels.level2, setOptions);
  form.setValue('categoryCascadeLevel3', levels.level3, setOptions);
  form.setValue('categoryCascadeLevel4', levels.level4, setOptions);
}
