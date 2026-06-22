'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ArticleSeoCharCounter } from '@/components/articles/ArticleSeoCharCounter';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  INSTITUTIONAL_HTML_HINT,
  SEO_DESCRIPTION_LIMIT,
  SEO_TITLE_LIMIT,
} from '@/components/legal/legal-editor-constants';
import {
  legalPageEditorFormSchema,
  type LegalPageEditorFormValues,
} from '@/components/legal/legal-editor-types';
import { LegalSectionFields } from '@/components/legal/LegalSectionFields';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import { updateAdminInstitutionalPageClient } from '@/lib/api/institutional-pages-client';
import { getClientBrandConfig } from '@/lib/brand';
import { cn } from '@/lib/utils';
import {
  LEGAL_SECTION_IDS,
  type AdminLegalInstitutionalPageResponse,
} from '@ecommerce-amazon/shared/legal';

type LegalPageEditorProps = {
  slug: string;
  pageTitle: string;
  initialData: AdminLegalInstitutionalPageResponse;
};

export function LegalPageEditor({
  slug,
  pageTitle,
  initialData,
}: LegalPageEditorProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const brand = getClientBrandConfig();
  const pendingStatusRef = useRef<'draft' | 'published'>('draft');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<LegalPageEditorFormValues>({
    resolver: zodResolver(legalPageEditorFormSchema),
    defaultValues: {
      seoTitle: initialData.layout.seoTitle ?? '',
      seoDescription: initialData.layout.seoDescription ?? '',
      content: {
        ...initialData.content,
        sections: initialData.content.sections.map((section) => ({
          ...section,
          listItems: section.listItems ?? [],
          subsections: section.subsections?.map((subsection) => ({
            ...subsection,
            paragraphs: subsection.paragraphs ?? [],
            listItems: subsection.listItems ?? [],
          })),
        })),
      },
    },
  });

  async function onSubmit(values: LegalPageEditorFormValues): Promise<void> {
    setIsSaving(true);
    try {
      const content = {
        ...values.content,
        sections: values.content.sections.map((section) => ({
          ...section,
          listItems:
            section.listItems && section.listItems.length > 0
              ? section.listItems.filter((item) => item.trim().length > 0)
              : undefined,
          subsections: section.subsections?.map((subsection) => ({
            ...subsection,
            paragraphs: subsection.paragraphs.filter((item) => item.trim().length > 0),
            listItems:
              subsection.listItems && subsection.listItems.length > 0
                ? subsection.listItems.filter((item) => item.trim().length > 0)
                : undefined,
          })),
        })),
      };

      await updateAdminInstitutionalPageClient('legal', {
        content,
        seoTitle: values.seoTitle.trim() ? values.seoTitle.trim() : null,
        seoDescription: values.seoDescription.trim() ? values.seoDescription.trim() : null,
        status: pendingStatusRef.current,
      });

      adminToast.success(
        pendingStatusRef.current === 'published' ? 'Página legal publicada.' : 'Rascunho salvo.',
      );
      router.refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar página');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSave(status: 'draft' | 'published') {
    pendingStatusRef.current = status;
    void form.handleSubmit(onSubmit)();
  }

  const isPublished = initialData.status === 'published';

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">Página institucional</h2>
          <p className="cms-panel-meta">
            <strong>{pageTitle}</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Edite privacidade, termos, afiliados e cookies em /{slug}. Texto é template editorial
              — revise com assessoria jurídica antes do go-live.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions flex flex-wrap items-center gap-2">
          <span className={cn('cms-status-pill', isPublished ? 'is-published' : 'is-draft')}>
            {isPublished ? 'Publicada' : 'Rascunho'}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`${brand.url}/legal`} target="_blank" rel="noopener noreferrer">
              Ver na vitrine
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            Salvar rascunho
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSave('published')}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            Publicar
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave('published');
            }}
          >
            <CmsFormSection title="SEO">
              <FormField
                control={form.control}
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
                    <FormDescription>Se vazio, usa o título da página legal.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>Meta description</FormLabel>
                      <ArticleSeoCharCounter
                        value={field.value ?? ''}
                        limit={SEO_DESCRIPTION_LIMIT}
                      />
                    </div>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} rows={3} maxLength={320} />
                    </FormControl>
                    <FormDescription>Se vazio, usa o parágrafo introdutório.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CmsFormSection>

            <CmsFormSection title="Introdução">
              <FormField
                control={form.control}
                name="content.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da página</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={160} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.intro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introdução</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} maxLength={500} />
                    </FormControl>
                    <FormDescription>{INSTITUTIONAL_HTML_HINT}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CmsFormSection>

            {LEGAL_SECTION_IDS.map((sectionId, sectionIndex) => (
              <LegalSectionFields
                key={sectionId}
                control={form.control}
                setValue={form.setValue}
                sectionIndex={sectionIndex}
                sectionId={sectionId}
              />
            ))}

            <CmsFormSection title="Metadados">
              <FormField
                control={form.control}
                name="content.lastUpdated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Última atualização</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly disabled />
                    </FormControl>
                    <FormDescription>
                      Atualizado automaticamente ao salvar ou publicar.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CmsFormSection>
          </form>
        </Form>
      </div>
    </section>
  );
}
