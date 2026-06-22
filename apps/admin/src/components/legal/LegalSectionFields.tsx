'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import type { LegalPageEditorFormValues } from '@/components/legal/legal-editor-types';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { LegalSectionId } from '@ecommerce-amazon/shared/legal';

import { INSTITUTIONAL_HTML_HINT, LEGAL_SECTION_LABELS } from './legal-editor-constants';

const TEXTAREA_CLASS =
  'flex min-h-[5rem] w-full rounded-lg border border-[color:var(--admin-gray)] bg-white px-3 py-2 text-sm text-[color:var(--admin-navy)] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-primary)]';

type LegalSectionFieldsProps = {
  control: Control<LegalPageEditorFormValues>;
  setValue: UseFormSetValue<LegalPageEditorFormValues>;
  sectionIndex: number;
  sectionId: LegalSectionId;
};

export function LegalSectionFields({
  control,
  setValue,
  sectionIndex,
  sectionId,
}: LegalSectionFieldsProps): React.JSX.Element {
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
  const subsections =
    useWatch({
      control,
      name: `content.sections.${sectionIndex}.subsections`,
    }) ?? [];

  function updateParagraphs(nextParagraphs: string[]): void {
    setValue(`content.sections.${sectionIndex}.paragraphs`, nextParagraphs, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function updateListItems(nextListItems: string[] | undefined): void {
    setValue(`content.sections.${sectionIndex}.listItems`, nextListItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function updateSubsections(
    nextSubsections: NonNullable<
      LegalPageEditorFormValues['content']['sections'][number]['subsections']
    >,
  ): void {
    setValue(`content.sections.${sectionIndex}.subsections`, nextSubsections, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <CmsFormSection title={LEGAL_SECTION_LABELS[sectionId]}>
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
          <p className="text-sm font-medium text-[color:var(--admin-navy)]">
            Itens de lista da seção (opcional)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateListItems([...(listItems ?? []), ''])}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Adicionar item
          </Button>
        </div>

        {(listItems ?? []).length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)]">Nenhum item de lista.</p>
        ) : (
          (listItems ?? []).map((_, listIndex) => (
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
                  updateListItems((listItems ?? []).filter((_, index) => index !== listIndex))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4 border-t border-[var(--admin-gray)] pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[color:var(--admin-navy)]">Subseções (opcional)</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateSubsections([
                ...subsections,
                { title: '', paragraphs: [''], listItems: undefined },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Adicionar subseção
          </Button>
        </div>

        {subsections.length === 0 ? (
          <p className="text-xs text-[var(--admin-text-muted)]">Nenhuma subseção.</p>
        ) : (
          subsections.map((subsection, subsectionIndex) => (
            <div
              key={`subsection-${sectionIndex}-${subsectionIndex}`}
              className="rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-muted)]/20 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
                  Subseção {subsectionIndex + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[var(--admin-text-muted)]"
                  aria-label="Remover subseção"
                  onClick={() =>
                    updateSubsections(subsections.filter((_, index) => index !== subsectionIndex))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <FormField
                control={control}
                name={`content.sections.${sectionIndex}.subsections.${subsectionIndex}.title`}
                render={({ field }) => (
                  <FormItem className="mb-3">
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(subsection.paragraphs ?? []).map((_, paragraphIndex) => (
                <div
                  key={`sub-paragraph-${sectionIndex}-${subsectionIndex}-${paragraphIndex}`}
                  className="mb-2 flex gap-2"
                >
                  <FormField
                    control={control}
                    name={`content.sections.${sectionIndex}.subsections.${subsectionIndex}.paragraphs.${paragraphIndex}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <textarea
                            {...field}
                            rows={3}
                            className={TEXTAREA_CLASS}
                            placeholder={`Parágrafo ${paragraphIndex + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(subsection.paragraphs ?? []).length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1 shrink-0"
                      aria-label="Remover parágrafo"
                      onClick={() => {
                        const next = (subsection.paragraphs ?? []).filter(
                          (_, index) => index !== paragraphIndex,
                        );
                        setValue(
                          `content.sections.${sectionIndex}.subsections.${subsectionIndex}.paragraphs`,
                          next,
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-3"
                onClick={() => {
                  setValue(
                    `content.sections.${sectionIndex}.subsections.${subsectionIndex}.paragraphs`,
                    [...(subsection.paragraphs ?? []), ''],
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Parágrafo
              </Button>

              {(subsection.listItems ?? []).map((_, listIndex) => (
                <div
                  key={`sub-list-${sectionIndex}-${subsectionIndex}-${listIndex}`}
                  className="mb-2 flex gap-2"
                >
                  <FormField
                    control={control}
                    name={`content.sections.${sectionIndex}.subsections.${subsectionIndex}.listItems.${listIndex}`}
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
                    className="shrink-0"
                    aria-label="Remover item"
                    onClick={() => {
                      const next = (subsection.listItems ?? []).filter(
                        (_, index) => index !== listIndex,
                      );
                      setValue(
                        `content.sections.${sectionIndex}.subsections.${subsectionIndex}.listItems`,
                        next.length > 0 ? next : undefined,
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setValue(
                    `content.sections.${sectionIndex}.subsections.${subsectionIndex}.listItems`,
                    [...(subsection.listItems ?? []), ''],
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Item de lista
              </Button>
            </div>
          ))
        )}
      </div>

      {sectionId === 'privacidade' ? (
        <p className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs text-blue-900">
          Esta seção corresponde à âncora #privacidade na vitrine /legal. Recomenda-se revisão
          jurídica antes de publicar alterações.
        </p>
      ) : null}
    </CmsFormSection>
  );
}
