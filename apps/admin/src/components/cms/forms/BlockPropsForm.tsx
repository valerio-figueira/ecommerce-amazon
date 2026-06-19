'use client';

import type { Control } from 'react-hook-form';

import type { CategoryBentoTileFormValue, HeroSlideFormValue } from '@/components/cms/props-forms/block-form-registry';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { CmsHybridImageField } from '@/components/cms/props-forms/CmsHybridImageField';
import { Input, Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export type BlockFormValues = {
  slides?: HeroSlideFormValue[];
  tiles?: CategoryBentoTileFormValue[];
  autoplay?: boolean;
  intervalMs?: number;
  categorySlugs?: string[];
  linkedBlockId?: string;
  title?: string;
  categorySlug?: string;
  marketplace?: string;
  sort?: string;
  pageSize?: number;
  columns?: number;
  productSlug?: string;
  showMarketplaceBadge?: boolean;
  ctaLabel?: string;
  subtitle?: string;
  categoryVertical?: string;
  minDiscountPercentage?: number;
  sortBy?: string;
  limit?: number;
  imageUrl?: string;
  alt?: string;
  href?: string;
  html?: string;
  align?: string;
  size?: string;
  slot1?: Record<string, unknown>;
  slot2?: Record<string, unknown>;
  slot3?: Record<string, unknown>;
  [key: string]: unknown;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function SpacerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <CmsFormSection title="Espaçamento vertical">
      <FormField
        control={control}
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quanto espaço adicionar?</FormLabel>
            <Select onValueChange={field.onChange} value={readString(field.value) || 'md'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="sm">Pequeno — respiro leve entre seções</SelectItem>
                <SelectItem value="md">Médio — separação padrão</SelectItem>
                <SelectItem value="lg">Grande — pausa visual mais ampla</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Use para criar respiro entre blocos sem adicionar conteúdo.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}

export function BannerFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <CmsFormSection title="Imagem">
        <FormField
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do banner</FormLabel>
              <FormControl>
                <CmsHybridImageField
                  value={readString(field.value)}
                  onChange={field.onChange}
                  preset="banner"
                />
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
              <FormLabel>Descrição da imagem</FormLabel>
              <FormControl>
                <Input {...field} value={readString(field.value)} placeholder="Ex: Promoção de verão" />
              </FormControl>
              <FormDescription>Texto alternativo para acessibilidade e SEO.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Link de destino" className="cms-form-section-divider">
        <FormField
          control={control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Para onde o banner leva?</FormLabel>
              <FormControl>
                <Input {...field} value={readString(field.value)} placeholder="https://… ou /colecoes/slug" />
              </FormControl>
              <FormDescription>Página interna ou link externo ao clicar no banner.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>
    </div>
  );
}

export function RichTextFormFields({
  control,
}: {
  control: Control<BlockFormValues>;
}): React.JSX.Element {
  return (
    <div className="space-y-6">
      <CmsFormSection title="Conteúdo editorial">
        <FormField
          control={control}
          name="html"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto da seção</FormLabel>
              <FormControl>
                <Textarea
                  rows={8}
                  {...field}
                  value={readString(field.value)}
                  placeholder="<p>Seu texto aqui…</p>"
                />
              </FormControl>
              <FormDescription>
                Conteúdo em HTML simples. Editor visual chegará em versão futura.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Layout" className="cms-form-section-divider">
        <FormField
          control={control}
          name="align"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alinhamento do texto</FormLabel>
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
      </CmsFormSection>
    </div>
  );
}

export function UnsupportedBlockForm({
  blockTypeLabel,
}: {
  blockTypeLabel: string;
  props?: unknown;
}): React.JSX.Element {
  return (
    <div className="cms-empty-state text-left">
      <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
        Edição amigável em breve
      </p>
      <p className="mx-auto mt-2 max-w-sm text-xs text-[var(--admin-text-muted)]">
        O bloco <strong>{blockTypeLabel}</strong> ainda não possui formulário visual nesta fase.
        Em breve você poderá configurá-lo por aqui. Consulte{' '}
        <code className="text-[10px]">docs/admin-cms-blocks-phase2.md</code> para o roadmap.
      </p>
    </div>
  );
}
