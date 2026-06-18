'use client';

import { useEffect, useMemo } from 'react';
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

  const roots = useMemo(
    () => options.filter((option) => option.depth === 0),
    [options],
  );

  useEffect(() => {
    if (!categoryId || level1 || options.length === 0) {
      return;
    }

    const path = resolvePath(categoryId, options);
    setCascadeLevels(form, {
      level1: path[0],
      level2: path[1],
      level3: path[2],
    });
  }, [categoryId, form, level1, options]);

  const level2Options = useMemo(
    () => (level1 ? options.filter((option) => option.parentId === level1) : []),
    [level1, options],
  );

  const level3Options = useMemo(
    () => (level2 ? options.filter((option) => option.parentId === level2) : []),
    [level2, options],
  );

  function setCategoryValue(value: string | undefined) {
    form.setValue('categoryId', value, { shouldDirty: true, shouldValidate: true });
  }

  function handleLevel1Change(value: string) {
    if (value === NONE_VALUE) {
      setCascadeLevels(form, {});
      setCategoryValue(undefined);
      return;
    }

    setCascadeLevels(form, { level1: value });

    const option = options.find((item) => item.id === value);
    if (option?.isLeaf) {
      setCategoryValue(value);
    } else {
      setCategoryValue(undefined);
    }
  }

  function handleLevel2Change(value: string) {
    if (value === NONE_VALUE) {
      setCascadeLevels(form, { level1 });
      setCategoryValue(undefined);
      return;
    }

    setCascadeLevels(form, { level1, level2: value });

    const option = options.find((item) => item.id === value);
    if (option?.isLeaf) {
      setCategoryValue(value);
    } else {
      setCategoryValue(undefined);
    }
  }

  function handleLevel3Change(value: string) {
    if (value === NONE_VALUE) {
      setCascadeLevels(form, { level1, level2 });
      setCategoryValue(undefined);
      return;
    }

    setCascadeLevels(form, { level1, level2, level3: value });
    setCategoryValue(value);
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
          </div>
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
    level1?: string;
    level2?: string;
    level3?: string;
  },
): void {
  const options = { shouldDirty: true, shouldValidate: true } as const;
  form.setValue('categoryCascadeLevel1', levels.level1, options);
  form.setValue('categoryCascadeLevel2', levels.level2, options);
  form.setValue('categoryCascadeLevel3', levels.level3, options);
}

function resolvePath(
  categoryId: string | undefined,
  options: CategoryFlatOption[],
): Array<string | undefined> {
  if (!categoryId) return [undefined, undefined, undefined];

  const byId = new Map(options.map((option) => [option.id, option]));
  const path: string[] = [];
  let current = byId.get(categoryId);

  while (current) {
    path.unshift(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return [path[0], path[1], path[2]];
}
