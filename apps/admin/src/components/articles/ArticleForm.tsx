'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { ArticleEditor } from '@/components/articles/ArticleEditor';
import { ArticleFieldHint } from '@/components/articles/ArticleFieldHint';
import { ArticleLlmPromptHelper } from '@/components/articles/ArticleLlmPromptHelper';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
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

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">{isEdit ? 'Editar artigo' : 'Novo artigo'}</h2>
          <p className="cms-panel-meta">
            <strong>{title || 'Sem título'}</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Conteúdo editorial com embeds dinâmicos via /produto.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel space-y-6">
        <CmsFormSection title="Identidade">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-title">Título</Label>
                <ArticleFieldHint text="Título principal do artigo na vitrine e no Google. Máx. 150 caracteres; gera o slug automaticamente até você editá-lo." />
              </div>
              <Input
                id="article-title"
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-slug">Slug</Label>
                <ArticleFieldHint text="URL amigável em kebab-case (ex.: guia-cadeira-ergonomica). Página pública: /artigos/{slug}. Evite alterar após publicar." />
              </div>
              <Input
                id="article-slug"
                value={slug}
                onChange={(event) => {
                  slugTouched.current = true;
                  setSlug(event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Tipo</Label>
                <ArticleFieldHint text="Guia, review, comparativo ou lookbook/social. Influencia o tom sugerido no prompt de IA e a expectativa do leitor." />
              </div>
              <Select
                value={type}
                onValueChange={(value) => setType(articleTypeSchema.parse(value))}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <ArticleFieldHint text="Rascunho fica só no admin. Publicado aparece em /artigos/{slug} e no picker do bloco Bento Hub Mix." />
              </div>
              <Select
                value={status}
                onValueChange={(value) => setStatus(articleStatusSchema.parse(value))}
              >
                <SelectTrigger>
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
            </div>
          </div>
        </CmsFormSection>

        <CmsFormSection title="Capa e resumo">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-cover">URL da capa</Label>
                <ArticleFieldHint text="Banner horizontal (16:9 ou 21:9) no topo da página e no bloco Bento quando não houver override no CMS." />
              </div>
              <Input
                id="article-cover"
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="article-excerpt">Resumo</Label>
                <ArticleFieldHint text="1–3 frases para listagens, Open Graph e introdução. Se vazio, a vitrine usa trecho do corpo." />
              </div>
              <Textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CmsFormSection>

        <CmsFormSection title="SEO">
          <div className="grid gap-4">
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
        </CmsFormSection>

        <CmsFormSection title="Conteúdo">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm text-[var(--admin-text-muted)]">
              Editor rico com embeds via <code className="text-xs">/produto</code> ou shortcode{' '}
              <code className="text-xs">[[product:slug]]</code>.
            </p>
            <ArticleFieldHint text="Digite /produto no editor ou use o botão para inserir cards de afiliado. A vitrine resolve preços do catálogo local em tempo real." />
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
        </CmsFormSection>
      </div>
    </section>
  );
}
