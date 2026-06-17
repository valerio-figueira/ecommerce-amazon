'use client';

import type { Control } from 'react-hook-form';

import { ArticleSeoCharCounter } from '@/components/articles/ArticleSeoCharCounter';
import type { AboutPageEditorFormValues } from '@/components/about/about-editor-types';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';

import { SEO_DESCRIPTION_LIMIT, SEO_TITLE_LIMIT } from './about-editor-constants';

type AboutSeoPanelProps = {
  control: Control<AboutPageEditorFormValues>;
};

export function AboutSeoPanel({ control }: AboutSeoPanelProps): React.JSX.Element {
  return (
    <CmsFormSection title="SEO">
      <FormField
        control={control}
        name="seoTitle"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>Título SEO</FormLabel>
              <ArticleSeoCharCounter value={field.value ?? ''} limit={SEO_TITLE_LIMIT} />
            </div>
            <FormControl>
              <Input {...field} value={field.value ?? ''} maxLength={160} />
            </FormControl>
            <FormDescription>
              Se vazio, a vitrine usa o título padrão da página Sobre.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="seoDescription"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>Meta description</FormLabel>
              <ArticleSeoCharCounter value={field.value ?? ''} limit={SEO_DESCRIPTION_LIMIT} />
            </div>
            <FormControl>
              <Textarea {...field} value={field.value ?? ''} rows={3} maxLength={320} />
            </FormControl>
            <FormDescription>
              Se vazio, usa o parágrafo introdutório do hero (até 160 caracteres).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
