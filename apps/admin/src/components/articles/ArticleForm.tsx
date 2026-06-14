'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { ArticleEditor } from '@/components/articles/ArticleEditor';
import { ArticleFieldHint } from '@/components/articles/ArticleFieldHint';
import { ArticleLlmPromptHelper } from '@/components/articles/ArticleLlmPromptHelper';
import { ArticleMetaBox } from '@/components/articles/ArticleMetaBox';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createAdminArticleClient,
  updateAdminArticleClient,
} from '@/lib/api/articles-client';
import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';
import {
  articleStatusSchema,
  articleTypeSchema,
  createArticleBodySchema,
} from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

type ArticleFormProps = {
  mode: 'create' | 'edit';
  articleId?: string;
  initialValues?: {
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string;
    body: string;
    type: ArticleType;
    status: ArticleStatus;
    seoTitle: string;
    seoDescription: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

const ARTICLE_TYPES = [
  { value: ArticleType.GUIDE, label: 'Guia' },
  { value: ArticleType.REVIEW, label: 'Review' },
  { value: ArticleType.COMPARISON, label: 'Comparativo' },
  { value: ArticleType.LOOKBOOK, label: 'Lookbook / Social' },
] as const;

const ARTICLE_STATUSES = [
  { value: ArticleStatus.DRAFT, label: 'Rascunho' },
  { value: ArticleStatus.PUBLISHED, label: 'Publicado' },
] as const;

function formatArticleDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function ArticleForm({
  mode,
  articleId,
  initialValues,
}: ArticleFormProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [slug, setSlug] = useState(initialValues?.slug ?? '');
  const [excerpt, setExcerpt] = useState(initialValues?.excerpt ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? '');
  const [body, setBody] = useState(initialValues?.body ?? '<p></p>');
  const [type, setType] = useState<ArticleType>(initialValues?.type ?? ArticleType.GUIDE);
  const [status, setStatus] = useState<ArticleStatus>(
    initialValues?.status ?? ArticleStatus.DRAFT,
  );
  const [seoTitle, setSeoTitle] = useState(initialValues?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialValues?.seoDescription ?? '');
  const [saving, setSaving] = useState(false);

  function handleTitleChange(value: string): void {
    setTitle(value);
    if (!slugTouched.current) {
      setSlug(slugifyTitle(value));
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const payload = createArticleBodySchema.parse({
        slug,
        title,
        excerpt,
        coverImageUrl: coverImageUrl.trim() === '' ? null : coverImageUrl.trim(),
        body,
        type,
        status,
        seoTitle: seoTitle.trim() === '' ? null : seoTitle.trim(),
        seoDescription: seoDescription.trim() === '' ? null : seoDescription.trim(),
      });

      if (isEdit) {
        if (!articleId) throw new Error('ID do artigo não informado');
        await updateAdminArticleClient(articleId, payload);
        adminToast.success('Artigo atualizado.');
        router.refresh();
      } else {
        const result = await createAdminArticleClient(payload);
        adminToast.success('Artigo criado.');
        router.push(`/artigos/${result.id}`);
      }
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar artigo');
    } finally {
      setSaving(false);
    }
  }

  const trimmedCover = coverImageUrl.trim();

  return (
    <section className="article-editor-section">
      <form
        className="article-admin-form article-admin-form--two-pane"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div className="article-main-panel">
          <div className="grid gap-3">
            <div className="grid gap-3 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-7">
                <div className="flex items-center gap-2">
                  <Label htmlFor="article-title">Título</Label>
                  <ArticleFieldHint text="Título principal do artigo na vitrine e no Google. Máx. 150 caracteres; gera o slug automaticamente até você editá-lo." />
                </div>
                <Input
                  id="article-title"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 lg:col-span-5">
                <div className="flex items-center gap-2">
                  <Label htmlFor="article-slug">
                    Slug{' '}
                    <span className="font-normal text-[var(--admin-text-muted)]">(opcional)</span>
                  </Label>
                  <ArticleFieldHint text="URL amigável em kebab-case (ex.: guia-cadeira-ergonomica). Página pública: /artigos/{slug}. Evite alterar após publicar." />
                </div>
                <Input
                  id="article-slug"
                  value={slug}
                  onChange={(event) => {
                    slugTouched.current = true;
                    setSlug(event.target.value);
                  }}
                  placeholder="ex: guia-cadeira-ergonomica"
                />
                <p className="article-form-text">
                  Se ficar em branco, será gerado a partir do título.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-excerpt">
                  Resumo{' '}
                  <span className="font-normal text-[var(--admin-text-muted)]">(opcional)</span>
                </Label>
                <ArticleFieldHint text="1–3 frases para listagens, Open Graph e introdução. Se vazio, a vitrine usa trecho do corpo." />
              </div>
              <Textarea
                id="article-excerpt"
                className="article-excerpt-field"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
              />
              <p className="article-form-text">
                Aparece na listagem e no Open Graph quando não há texto completo.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="article-content">
                    Conteúdo{' '}
                    <span className="font-normal text-[var(--admin-text-muted)]">(opcional)</span>
                  </Label>
                  <ArticleFieldHint text="Digite /produto no editor ou use o botão para inserir cards de afiliado. A vitrine resolve preços do catálogo local em tempo real." />
                </div>
                <ArticleLlmPromptHelper
                  title={title}
                  slug={slug}
                  excerpt={excerpt}
                  coverImageUrl={coverImageUrl}
                  body={body}
                  type={type}
                  status={status}
                  seoTitle={seoTitle}
                  seoDescription={seoDescription}
                />
              </div>
              <ArticleEditor value={body} onChange={setBody} />
              <p className="article-form-text">
                Editor rico com embeds via <code className="text-xs">/produto</code> ou shortcode{' '}
                <code className="text-xs">[[product:slug]]</code>. Alterne para Código HTML para
                colar conteúdo gerado por IA.
              </p>
            </div>
          </div>
        </div>

        <aside className="article-side-panel">
          <ArticleMetaBox title="Publicar">
            <div className="mb-3 space-y-2">
              <Label htmlFor="article-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(articleStatusSchema.parse(value))}
              >
                <SelectTrigger id="article-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="article-form-text">
                Publicado aparece em /artigos/&#123;slug&#125; e no picker do bloco Bento Hub Mix.
              </p>
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-type">Tipo</Label>
                <ArticleFieldHint text="Guia, review, comparativo ou lookbook/social. Influencia o tom sugerido no prompt de IA." />
              </div>
              <Select
                value={type}
                onValueChange={(value) => setType(articleTypeSchema.parse(value))}
              >
                <SelectTrigger id="article-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={saving}>
              <Save className="mr-1 h-4 w-4" />
              {saving ? 'Salvando…' : isEdit ? 'Guardar' : 'Cadastrar'}
            </Button>
          </ArticleMetaBox>

          <ArticleMetaBox title="Capa">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-cover">
                  URL da capa{' '}
                  <span className="font-normal text-[var(--admin-text-muted)]">(opcional)</span>
                </Label>
                <ArticleFieldHint text="Banner horizontal (16:9 ou 21:9) no topo da página e no bloco Bento quando não houver override no CMS." />
              </div>
              {trimmedCover !== '' ? (
                <img
                  src={trimmedCover}
                  alt="Capa atual"
                  className="mb-2 max-w-[220px] rounded-md border border-neutral-200"
                />
              ) : null}
              <Input
                id="article-cover"
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://…"
              />
              <p className="article-form-text">
                Priorize imagens horizontais, nítidas e com licença adequada (ex.: Pexels).
              </p>
            </div>
          </ArticleMetaBox>

          <ArticleMetaBox title="SEO">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="article-seo-title">Título SEO</Label>
                  <ArticleFieldHint text="Título da aba e do Google. Ideal ≤ 60 caracteres visíveis; se vazio, usa o título do artigo." />
                </div>
                <Input
                  id="article-seo-title"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="article-seo-description">Descrição SEO</Label>
                  <ArticleFieldHint text="Snippet nos resultados de busca. Alvo: 140–160 caracteres com curadoria e comparação de preços, sem urgência falsa." />
                </div>
                <Textarea
                  id="article-seo-description"
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </ArticleMetaBox>

          {isEdit ? (
            <ArticleMetaBox title="Metadados">
              <div className="space-y-1 text-sm text-[var(--admin-text-muted)]">
                <div>
                  <strong className="text-[var(--admin-navy)]">Slug:</strong> /artigos/{slug || '—'}
                </div>
                <div>
                  <strong className="text-[var(--admin-navy)]">Criado em:</strong>{' '}
                  {formatArticleDate(initialValues?.createdAt)}
                </div>
                <div>
                  <strong className="text-[var(--admin-navy)]">Atualizado em:</strong>{' '}
                  {formatArticleDate(initialValues?.updatedAt)}
                </div>
              </div>
            </ArticleMetaBox>
          ) : null}
        </aside>
      </form>
    </section>
  );
}
