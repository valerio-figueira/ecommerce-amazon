'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AboutSectionFields } from '@/components/about/AboutSectionFields';
import { AboutSeoPanel } from '@/components/about/AboutSeoPanel';
import { AboutTrafficDirectionPanel } from '@/components/about/AboutTrafficLinksFields';
import { INSTITUTIONAL_HTML_HINT } from '@/components/about/about-editor-constants';
import {
  aboutPageEditorFormSchema,
  type AboutPageEditorFormValues,
} from '@/components/about/about-editor-types';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
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
  type AboutSectionId,
  type AdminInstitutionalPageResponse,
} from '@ecommerce-amazon/shared/about';

type AboutPageEditorProps = {
  slug: string;
  pageTitle: string;
  initialData: AdminInstitutionalPageResponse;
};

const SECTION_IDS: AboutSectionId[] = ['proposta', 'metodo', 'afiliados', 'equipe'];

const TEXTAREA_CLASS =
  'flex min-h-[5rem] w-full rounded-lg border border-[color:var(--admin-gray)] bg-white px-3 py-2 text-sm text-[color:var(--admin-navy)] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-primary)]';

export function AboutPageEditor({
  slug,
  pageTitle,
  initialData,
}: AboutPageEditorProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const brand = getClientBrandConfig();
  const pendingStatusRef = useRef<'draft' | 'published'>('draft');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AboutPageEditorFormValues>({
    resolver: zodResolver(aboutPageEditorFormSchema),
    defaultValues: {
      seoTitle: initialData.layout.seoTitle ?? '',
      seoDescription: initialData.layout.seoDescription ?? '',
      content: {
        ...initialData.content,
        sections: initialData.content.sections.map((section) => ({
          ...section,
          listItems: section.listItems ?? [],
        })),
      },
    },
  });

  async function onSubmit(values: AboutPageEditorFormValues): Promise<void> {
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
        })),
      };

      await updateAdminInstitutionalPageClient(slug, {
        content,
        seoTitle: values.seoTitle.trim() ? values.seoTitle.trim() : null,
        seoDescription: values.seoDescription.trim() ? values.seoDescription.trim() : null,
        status: pendingStatusRef.current,
      });

      adminToast.success(
        pendingStatusRef.current === 'published'
          ? 'Página Sobre publicada.'
          : 'Rascunho salvo.',
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
              Edite o conteúdo editorial da vitrine /{slug}. A equipe é gerenciada em Perfil.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'cms-status-pill',
              isPublished ? 'is-published' : 'is-draft',
            )}
          >
            {isPublished ? 'Publicada' : 'Rascunho'}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`${brand.url}/sobre`} target="_blank" rel="noopener noreferrer">
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
            <AboutSeoPanel control={form.control} />

            <CmsFormSection title="Hero">
              <FormField
                control={form.control}
                name="content.heroTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título principal</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={160} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.heroIntro"
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

            {SECTION_IDS.map((sectionId, sectionIndex) => (
              <AboutSectionFields
                key={sectionId}
                control={form.control}
                setValue={form.setValue}
                sectionIndex={sectionIndex}
                sectionId={sectionId}
              />
            ))}

            <CmsFormSection title="Equipe na vitrine">
              <FormField
                control={form.control}
                name="content.teamSectionIntro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto introdutório da seção #equipe</FormLabel>
                    <FormControl>
                      <textarea {...field} rows={4} className={TEXTAREA_CLASS} maxLength={500} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-muted)]/40 px-3 py-2 text-xs text-[var(--admin-text-muted)]">
                Os cards de membros vêm dos perfis com{' '}
                <Link href="/perfil" className="font-medium text-[var(--admin-primary)] underline">
                  Exibir na página Sobre
                </Link>
                . Não edite a equipe aqui.
              </p>
            </CmsFormSection>

            <AboutTrafficDirectionPanel control={form.control} />

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
