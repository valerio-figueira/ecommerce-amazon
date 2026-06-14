'use client';

import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { ArticleIdPicker } from '@/components/cms/props-forms/ArticleIdPicker';
import { BentoHubMixPreview } from '@/components/cms/props-forms/BentoHubMixPreview';
import {
  BENTO_SLOT1_CONTENT_TYPE_OPTIONS,
  BENTO_SLOT3_CONTENT_TYPE_OPTIONS,
  BENTO_SLOT_LABELS,
} from '@/components/cms/props-forms/bento-hub-mix-form-meta';
import { CollectionIdPicker } from '@/components/cms/props-forms/CollectionIdPicker';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { ProductIdPicker } from '@/components/cms/props-forms/ProductIdPicker';
import { ProductMultiPicker } from '@/components/cms/props-forms/ProductMultiPicker';
import { getCategoryDisplayLabel } from '@/components/cms/props-forms/dynamic-grid-form-meta';
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
import type {
  AdminArticlePickerOption,
  AdminCollectionPickerOption,
  ProductPickerOption,
} from '@/lib/api/cms-pages-client';

type BentoHubMixFormProps = {
  control: Control<BlockFormValues>;
  collections: AdminCollectionPickerOption[];
  articles: AdminArticlePickerOption[];
  products: ProductPickerOption[];
  categories: Array<{ slug: string; label: string }>;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function BentoHubMixForm({
  control,
  collections,
  articles,
  products,
  categories,
}: BentoHubMixFormProps): React.JSX.Element {
  const slot1ContentType = useWatch({ control, name: 'slot1.contentType' });
  const slot3ContentType = useWatch({ control, name: 'slot3.contentType' });

  const slot1Type = readString(slot1ContentType) || 'collection';
  const slot3Type = readString(slot3ContentType) || 'category';

  return (
    <div className="space-y-6">
      <CmsFormSection title={BENTO_SLOT_LABELS.slot1}>
        <FormField
          control={control}
          name="slot1.contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de conteúdo</FormLabel>
              <Select onValueChange={field.onChange} value={readString(field.value) || 'collection'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BENTO_SLOT1_CONTENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="slot1.entityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {slot1Type === 'collection' ? 'Coleção' : 'Artigo'}
              </FormLabel>
              <FormControl>
                {slot1Type === 'collection' ? (
                  <CollectionIdPicker
                    collections={collections}
                    value={readString(field.value)}
                    onChange={field.onChange}
                  />
                ) : (
                  <ArticleIdPicker
                    articles={articles}
                    value={readString(field.value)}
                    onChange={field.onChange}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="slot1.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título customizado (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Sobrescreve o título da entidade"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="slot1.subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={readString(field.value)} placeholder="Texto de apoio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="slot1.coverImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Imagem de capa{slot1Type === 'article' ? '' : ' (opcional)'}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="https://…"
                />
              </FormControl>
              <FormDescription>
                {slot1Type === 'article'
                  ? 'Obrigatório para artigos — não há capa no catálogo editorial.'
                  : 'Deixe em branco para usar a capa da coleção.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title={BENTO_SLOT_LABELS.slot2} className="cms-form-section-divider">
        <FormField
          control={control}
          name="slot2.productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto em destaque</FormLabel>
              <FormControl>
                <ProductIdPicker
                  products={products}
                  value={readString(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                O badge de desconto é calculado automaticamente na vitrine.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title={BENTO_SLOT_LABELS.slot3} className="cms-form-section-divider">
        <FormField
          control={control}
          name="slot3.contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo da lista</FormLabel>
              <Select onValueChange={field.onChange} value={readString(field.value) || 'category'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BENTO_SLOT3_CONTENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {slot3Type === 'category' ? (
          <>
            <FormField
              control={control}
              name="slot3.categorySlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={readString(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {getCategoryDisplayLabel(category.slug, category.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Exibe os 3 produtos com maior score editorial.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="slot3.listTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da lista (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={readString(field.value)}
                      placeholder="Ex: Top Games"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <FormField
            control={control}
            name="slot3.productIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produtos (máx. 3)</FormLabel>
                <FormControl>
                  <ProductMultiPicker
                    products={products}
                    value={readStringArray(field.value)}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CmsFormSection>

      <CmsFormSection title="Pré-visualização" className="cms-form-section-divider">
        <BentoHubMixPreview
          control={control}
          collections={collections}
          articles={articles}
          products={products}
          categories={categories}
        />
      </CmsFormSection>
    </div>
  );
}
