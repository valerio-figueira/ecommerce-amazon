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
import { Switch } from '@/components/ui/switch';
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

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readMode(value: unknown): 'filter' | 'link' {
  return value === 'link' ? 'link' : 'filter';
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
                Prefira categorias raiz (ex.: Home Office, Games). Subcategorias aparecem
                automaticamente na segunda fileira ao selecionar um pai com filhos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Comportamento" className="cms-form-section-divider">
        <FormField
          control={control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo de interação</FormLabel>
              <Select value={readMode(field.value)} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="filter">Filtrar grade na mesma página</SelectItem>
                  <SelectItem value="link">Navegar para /categorias/{'{slug}'}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Use &quot;Filtrar&quot; quando as pills estiverem vinculadas a uma grade de
                produtos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="showSubcategories"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="space-y-0.5">
                <FormLabel>Exibir subcategorias em cascata</FormLabel>
                <FormDescription>
                  Segunda fileira de pills ao selecionar uma categoria com filhos.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={readBoolean(field.value, true)}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
