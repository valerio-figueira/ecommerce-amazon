'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';

import type { AboutPageEditorFormValues } from '@/components/about/about-editor-types';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AboutSectionId } from '@ecommerce-amazon/shared/about';

import { ABOUT_SECTION_LABELS, INSTITUTIONAL_HTML_HINT } from './about-editor-constants';

const TEXTAREA_CLASS =
  'flex min-h-[5rem] w-full rounded-lg border border-[color:var(--admin-gray)] bg-white px-3 py-2 text-sm text-[color:var(--admin-navy)] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-primary)]';

type AboutSectionFieldsProps = {
  control: Control<AboutPageEditorFormValues>;
  setValue: UseFormSetValue<AboutPageEditorFormValues>;
  sectionIndex: number;
  sectionId: AboutSectionId;
};

export function AboutSectionFields({
  control,
  setValue,
  sectionIndex,
  sectionId,
}: AboutSectionFieldsProps): React.JSX.Element {
  const paragraphs =
    useWatch({
      control,
      name: `content.sections.${sectionIndex}.paragraphs`,
    }) ?? [];
  const listItems =
    useWatch({
      control,
      name: `content.sections.${sectionIndex}.listItems`,
    }) ?? [];

  const isAffiliates = sectionId === 'afiliados';

  function updateParagraphs(nextParagraphs: string[]): void {
    setValue(`content.sections.${sectionIndex}.paragraphs`, nextParagraphs, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function updateListItems(nextListItems: string[]): void {
    setValue(`content.sections.${sectionIndex}.listItems`, nextListItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <CmsFormSection title={ABOUT_SECTION_LABELS[sectionId]}>
      <FormField
        control={control}
        name={`content.sections.${sectionIndex}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da seção</FormLabel>
            <FormControl>
              <Input {...field} maxLength={120} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[color:var(--admin-navy)]">Parágrafos</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateParagraphs([...paragraphs, ''])}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Adicionar parágrafo
          </Button>
        </div>

        {paragraphs.map((_, paragraphIndex) => (
          <div key={`paragraph-${sectionIndex}-${paragraphIndex}`} className="flex gap-2">
            <FormField
              control={control}
              name={`content.sections.${sectionIndex}.paragraphs.${paragraphIndex}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className={TEXTAREA_CLASS}
                      placeholder={`Parágrafo ${paragraphIndex + 1}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {paragraphs.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-1 shrink-0 text-[var(--admin-text-muted)]"
                aria-label="Remover parágrafo"
                onClick={() =>
                  updateParagraphs(paragraphs.filter((_, index) => index !== paragraphIndex))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ))}
        <p className="text-xs text-[var(--admin-text-muted)]">{INSTITUTIONAL_HTML_HINT}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[color:var(--admin-navy)]">Itens de lista (opcional)</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateListItems([...listItems, ''])}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Adicionar item
          </Button>
        </div>

        {listItems.length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)]">Nenhum item de lista.</p>
        ) : (
          listItems.map((_, listIndex) => (
            <div key={`list-item-${sectionIndex}-${listIndex}`} className="flex gap-2">
              <FormField
                control={control}
                name={`content.sections.${sectionIndex}.listItems.${listIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input {...field} placeholder={`Item ${listIndex + 1}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-[var(--admin-text-muted)]"
                aria-label="Remover item"
                onClick={() =>
                  updateListItems(listItems.filter((_, index) => index !== listIndex))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {isAffiliates ? (
        <p className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          Esta seção é exibida como callout de disclosure na vitrine, com link automático para
          /legal#afiliados.
        </p>
      ) : null}
    </CmsFormSection>
  );
}
