'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import type { Control } from 'react-hook-form';

import { getBlockDisplayTitle } from '@/components/cms/block-type-labels';
import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { CategoryMultiSelect } from '@/components/cms/props-forms/CategoryMultiSelect';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { NONE_LINKED_BLOCK } from '@/components/cms/props-forms/block-form-registry';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CategoryOption = { slug: string; label: string };

type CategoryPillsFormProps = {
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
  pageBlocks: AdminBlock[];
  currentBlockId?: string | undefined;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function CategoryPillsForm({
  control,
  categories,
  pageBlocks,
  currentBlockId,
}: CategoryPillsFormProps): React.JSX.Element {
  const gridBlocks = pageBlocks.filter(
    (item) => item.type === BlockType.PRODUCT_GRID && item.id !== currentBlockId,
  );

  return (
    <div className="space-y-6">
      <CmsFormSection title="Texto da faixa">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ex: Navegue por categoria"
                />
              </FormControl>
              <FormDescription>
                Aparece acima dos atalhos de categoria na vitrine.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Categorias exibidas" className="cms-form-section-divider">
        <FormField
          control={control}
          name="categorySlugs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quais atalhos mostrar?</FormLabel>
              <FormControl>
                <CategoryMultiSelect
                  categories={categories}
                  value={readStringArray(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Escolha quais categorias aparecem na faixa horizontal e defina a ordem.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      {gridBlocks.length > 0 && (
        <CmsFormSection title="Integração (opcional)" className="cms-form-section-divider">
          <FormField
            control={control}
            name="linkedBlockId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filtrar grade de produtos abaixo</FormLabel>
                <Select
                  value={readString(field.value) || NONE_LINKED_BLOCK}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma grade vinculada" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_LINKED_BLOCK}>Não vincular a nenhuma grade</SelectItem>
                    {gridBlocks.map((gridBlock) => (
                      <SelectItem key={gridBlock.id} value={gridBlock.id}>
                        {getBlockDisplayTitle(gridBlock.type, gridBlock.props)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Ao clicar numa categoria, a grade escolhida pode filtrar os produtos
                  automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CmsFormSection>
      )}
    </div>
  );
}
