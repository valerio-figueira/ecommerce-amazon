'use client';

import type { Control } from 'react-hook-form';

import { Input, Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export type BlockFormValues = Record<string, unknown>;

type CategoryOption = { slug: string; label: string };

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readOptionalNumber(value: unknown): number | '' {
  return typeof value === 'number' ? value : '';
}

type DynamicProductGridFormFieldsProps = {
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
};

export function DynamicProductGridFormFields({
  control,
  categories,
}: DynamicProductGridFormFieldsProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título editorial</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="subtitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtítulo (opcional)</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="categoryVertical"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vertical / Categoria</FormLabel>
            <Select
              onValueChange={(value) =>
                field.onChange(value === '__all__' ? undefined : value)
              }
              value={readString(field.value) || '__all__'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="minDiscountPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Desconto mínimo (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={100}
                value={readOptionalNumber(field.value)}
                onChange={(event) => {
                  const value = event.target.value;
                  field.onChange(value === '' ? undefined : Number(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="sortBy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Critério de ordenação</FormLabel>
            <Select onValueChange={field.onChange} value={readString(field.value) || 'editorial_score'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="editorial_score">Score editorial</SelectItem>
                <SelectItem value="created_at">Mais recentes</SelectItem>
                <SelectItem value="price_asc">Menor preço</SelectItem>
                <SelectItem value="price_desc">Maior preço</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="limit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantidade de produtos</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={24}
                value={readOptionalNumber(field.value)}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function SpacerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <FormField
      control={control}
      name="size"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tamanho</FormLabel>
          <Select onValueChange={field.onChange} value={readString(field.value) || 'md'}>
            <FormControl>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="sm">Pequeno</SelectItem>
              <SelectItem value="md">Médio</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function BannerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL da imagem</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="href"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link de destino</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="alt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto alternativo</FormLabel>
            <FormControl>
              <Input {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function RichTextFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="html"
        render={({ field }) => (
          <FormItem>
            <FormLabel>HTML</FormLabel>
            <FormControl>
              <Textarea rows={8} {...field} value={readString(field.value)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="align"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alinhamento</FormLabel>
            <Select onValueChange={field.onChange} value={readString(field.value) || 'left'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="left">Esquerda</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="right">Direita</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function UnsupportedBlockForm({ props }: { props: unknown }): React.JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--admin-text-muted)]">
        Formulário deste tipo em desenvolvimento. Props atuais:
      </p>
      <pre className="max-h-64 overflow-auto rounded-md bg-[var(--admin-bg)] p-3 text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  );
}
