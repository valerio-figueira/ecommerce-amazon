'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

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
import type { CategoryFlatOption } from '@/lib/api/categories';
import type { ProductFormValues } from '@/lib/product-form-values';

const NONE_VALUE = '__none__';

type CategoryCascadeSelectProps = {
  options: CategoryFlatOption[];
};

export function CategoryCascadeSelect({ options }: CategoryCascadeSelectProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const categoryId = form.watch('categoryId');

  const roots = useMemo(
    () => options.filter((option) => option.depth === 0),
    [options],
  );

  const selectedPath = useMemo(() => resolvePath(categoryId, options), [categoryId, options]);

  const [level1, setLevel1] = useState<string | undefined>(selectedPath[0]);
  const [level2, setLevel2] = useState<string | undefined>(selectedPath[1]);
  const [level3, setLevel3] = useState<string | undefined>(selectedPath[2]);

  useEffect(() => {
    setLevel1(selectedPath[0]);
    setLevel2(selectedPath[1]);
    setLevel3(selectedPath[2]);
  }, [selectedPath]);

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
      setLevel1(undefined);
      setLevel2(undefined);
      setLevel3(undefined);
      setCategoryValue(undefined);
      return;
    }

    setLevel1(value);
    setLevel2(undefined);
    setLevel3(undefined);

    const option = options.find((item) => item.id === value);
    if (option?.isLeaf) {
      setCategoryValue(value);
    } else {
      setCategoryValue(undefined);
    }
  }

  function handleLevel2Change(value: string) {
    if (value === NONE_VALUE) {
      setLevel2(undefined);
      setLevel3(undefined);
      setCategoryValue(undefined);
      return;
    }

    setLevel2(value);
    setLevel3(undefined);

    const option = options.find((item) => item.id === value);
    if (option?.isLeaf) {
      setCategoryValue(value);
    } else {
      setCategoryValue(undefined);
    }
  }

  function handleLevel3Change(value: string) {
    if (value === NONE_VALUE) {
      setLevel3(undefined);
      setCategoryValue(undefined);
      return;
    }

    setLevel3(value);
    setCategoryValue(value);
  }

  return (
    <FormField
      control={form.control}
      name="categoryId"
      render={() => (
        <FormItem>
          <FormLabel>Categoria</FormLabel>
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
