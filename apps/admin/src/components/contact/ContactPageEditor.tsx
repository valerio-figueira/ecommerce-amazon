'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ArticleSeoCharCounter } from '@/components/articles/ArticleSeoCharCounter';
import {
  contactPageEditorFormSchema,
  type ContactPageEditorFormValues,
} from '@/components/contact/contact-editor-types';
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
import { Switch } from '@/components/ui/switch';
import { updateAdminInstitutionalPageClient } from '@/lib/api/institutional-pages-client';
import { getClientBrandConfig } from '@/lib/brand';
import { cn } from '@/lib/utils';
import {
  normalizeContactSocialLinks,
  type AdminContactInstitutionalPageResponse,
  type ContactPageContent,
} from '@ecommerce-amazon/shared/contact';

import {
  INSTITUTIONAL_HTML_HINT,
  SEO_DESCRIPTION_LIMIT,
  SEO_TITLE_LIMIT,
} from '@/components/legal/legal-editor-constants';

const CONTACT_SOCIAL_NETWORKS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X (Twitter)' },
] as const;

function toEditorSocialLinks(
  content: ContactPageContent,
): ContactPageEditorFormValues['content']['socialLinks'] {
  return {
    linkedin: content.socialLinks.linkedin ?? '',
    instagram: content.socialLinks.instagram ?? '',
    x: content.socialLinks.x ?? '',
    telegram: content.socialLinks.telegram ?? '',
  };
}

function toPersistedContactContent(
  content: ContactPageEditorFormValues['content'],
): ContactPageContent {
  return {
    ...content,
    socialLinks: normalizeContactSocialLinks(content.socialLinks),
  };
}

type ContactPageEditorProps = {
  slug: string;
  pageTitle: string;
  initialData: AdminContactInstitutionalPageResponse;
};

export function ContactPageEditor({
  slug,
  pageTitle,
  initialData,
}: ContactPageEditorProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const brand = getClientBrandConfig();
  const pendingStatusRef = useRef<'draft' | 'published'>('draft');
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ContactPageEditorFormValues>({
    resolver: zodResolver(contactPageEditorFormSchema),
    defaultValues: {
      seoTitle: initialData.layout.seoTitle ?? '',
      seoDescription: initialData.layout.seoDescription ?? '',
      content: {
        ...initialData.content,
        socialLinks: toEditorSocialLinks(initialData.content),
      },
    },
  });

  async function onSubmit(values: ContactPageEditorFormValues): Promise<void> {
    setIsSaving(true);
    try {
      await updateAdminInstitutionalPageClient('contato', {
        content: toPersistedContactContent(values.content),
        seoTitle: values.seoTitle.trim() ? values.seoTitle.trim() : null,
        seoDescription: values.seoDescription.trim() ? values.seoDescription.trim() : null,
        status: pendingStatusRef.current,
      });

      adminToast.success(
        pendingStatusRef.current === 'published'
          ? 'Página de contato publicada.'
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
              Edite o conteúdo da vitrine /{slug}, redes sociais e visibilidade na home.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions flex flex-wrap items-center gap-2">
          <span className={cn('cms-status-pill', isPublished ? 'is-published' : 'is-draft')}>
            {isPublished ? 'Publicada' : 'Rascunho'}
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`${brand.url}/contato`} target="_blank" rel="noopener noreferrer">
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
                    <FormDescription>Se vazio, usa o título padrão da página.</FormDescription>
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

            <CmsFormSection title="Conteúdo principal">
              <FormField
                control={form.control}
                name="content.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da página</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} />
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

            <CmsFormSection title="Canal de contato">
              <FormField
                control={form.control}
                name="content.emailLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rótulo do e-mail</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={60} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail exibido</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" maxLength={120} />
                    </FormControl>
                    <FormDescription>
                      Endereço exibido na vitrine. Pode diferir do CONTACT_EMAIL de infra.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.socialHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da seção de redes</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.socialsEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-[color:var(--admin-gray)]/60 px-4 py-3">
                    <div className="space-y-1">
                      <FormLabel>Exibir redes sociais</FormLabel>
                      <FormDescription>
                        Quando desativado, a seção de redes some da página /contato e da home.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACT_SOCIAL_NETWORKS.map(({ key, label }) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`content.socialLinks.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </CmsFormSection>

            <CmsFormSection title="Visibilidade na home">
              <FormField
                control={form.control}
                name="content.showOnHome"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-[color:var(--admin-gray)]/60 px-4 py-3">
                    <div className="space-y-1">
                      <FormLabel>Exibir bloco de contato na home</FormLabel>
                      <FormDescription>
                        Mostra um resumo com e-mail e redes (se ativas) no final da página inicial.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CmsFormSection>

            <CmsFormSection title="Links de rodapé">
              <FormField
                control={form.control}
                name="content.aboutLinkLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do link Sobre</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={80} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.legalLinkLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do link Políticas legais</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={120} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CmsFormSection>

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
