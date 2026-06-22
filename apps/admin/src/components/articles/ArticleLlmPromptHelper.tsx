'use client';

import { Check, Copy, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  buildArticleEditorialLlmPrompt,
  parseArticleEditorialLlmResponse,
  type ArticleEditorialLlmResponse,
} from '@/lib/article-llm-prompt';
import type { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';

const TOOLTIP_HINT =
  'Abrir prompt pronto para copiar e colar em ChatGPT, Gemini ou outra IA externa';

type ArticleLlmPromptHelperProps = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  body: string;
  type: ArticleType;
  status: ArticleStatus;
  seoTitle: string;
  seoDescription: string;
  onApply: (response: ArticleEditorialLlmResponse) => void;
};

export function ArticleLlmPromptHelper({
  title,
  slug,
  excerpt,
  coverImageUrl,
  body,
  type,
  status,
  seoTitle,
  seoDescription,
  onApply,
}: ArticleLlmPromptHelperProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [llmResponse, setLlmResponse] = useState('');

  const prompt = useMemo(
    () =>
      buildArticleEditorialLlmPrompt({
        title,
        slug,
        excerpt,
        coverImageUrl,
        body,
        type,
        status,
        seoTitle,
        seoDescription,
      }),
    [body, coverImageUrl, excerpt, seoDescription, seoTitle, slug, status, title, type],
  );

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      adminToast.success('Prompt copiado. Cole na IA de sua preferência.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      adminToast.error('Não foi possível copiar. Selecione o texto manualmente.');
    }
  };

  const handleApply = (): void => {
    try {
      const parsed = parseArticleEditorialLlmResponse(llmResponse);
      onApply(parsed);
      adminToast.success(
        'Conteúdo aplicado no formulário. Revise título, SEO, capa e corpo antes de publicar.',
      );
      setOpen(false);
      setLlmResponse('');
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : 'Não foi possível aplicar a resposta.',
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setLlmResponse('');
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          title={TOOLTIP_HINT}
          aria-label={TOOLTIP_HINT}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-accent-subtle)] hover:text-[var(--admin-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-focus-ring)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prompt para gerar artigo editorial</DialogTitle>
          <DialogDescription>
            O prompt pede JSON com título, resumo, SEO, capa e corpo HTML (shortcodes{' '}
            <code className="text-[var(--admin-navy)]">[[product:slug]]</code>). Copie na LLM
            externa, cole o JSON de volta e aplique no formulário — mesmo fluxo do SEO de produtos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
            1. Prompt para a LLM
          </Label>
          <pre className="max-h-[32vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] p-4 font-mono text-xs leading-relaxed text-[var(--admin-navy)]">
            {prompt}
          </pre>
        </div>

        <div className="space-y-2 border-t border-[var(--admin-gray)] pt-4">
          <Label
            htmlFor="article-llm-response"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]"
          >
            2. Resposta da IA (JSON)
          </Label>
          <Textarea
            id="article-llm-response"
            rows={8}
            value={llmResponse}
            onChange={(event) => setLlmResponse(event.target.value)}
            placeholder='{"title":"Guia de cadeiras ergonômicas","excerpt":"Resumo para listagens.","seoTitle":"Guia de cadeiras | Curadoria","seoDescription":"Comparativo editorial e dicas para home office.","coverImageUrl":"","body":"<h2>Visão geral</h2><p>Texto com [[product:slug-exemplo]]</p>"}'
            className="font-mono text-xs"
          />
          <p className="text-xs text-[var(--admin-text-muted)]">
            Aceita chaves <code className="text-[var(--admin-navy)]">seoTitle</code> /{' '}
            <code className="text-[var(--admin-navy)]">seoDescription</code> (ou{' '}
            <code className="text-[var(--admin-navy)]">metaTitle</code> /{' '}
            <code className="text-[var(--admin-navy)]">metaDescription</code>). O campo{' '}
            <code className="text-[var(--admin-navy)]">body</code> deve ser HTML puro. Revise embeds
            e contadores SEO antes de publicar.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="primary" size="sm" onClick={() => void handleCopy()}>
            <Copy className="h-4 w-4" />
            {copied ? 'Prompt copiado!' : 'Copiar prompt'}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={llmResponse.trim().length === 0}
            onClick={handleApply}
          >
            <Check className="h-4 w-4" />
            Aplicar no formulário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
