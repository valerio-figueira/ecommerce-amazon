'use client';

import { Copy, Sparkles } from 'lucide-react';
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
import { buildArticleEditorialLlmPrompt } from '@/lib/article-llm-prompt';
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
}: ArticleLlmPromptHelperProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prompt para gerar artigo editorial</DialogTitle>
          <DialogDescription>
            Copie o texto abaixo e cole em uma LLM externa (ChatGPT, Gemini, Claude, etc.). A IA
            deve retornar JSON com título, resumo, SEO, capa e corpo HTML com shortcodes
            [[product:slug]]. Revise e cole os campos no formulário antes de publicar.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] p-4 font-mono text-xs leading-relaxed text-[var(--admin-navy)]">
          {prompt}
        </pre>
        <DialogFooter>
          <Button type="button" variant="primary" size="sm" onClick={() => void handleCopy()}>
            <Copy className="h-4 w-4" />
            {copied ? 'Copiado!' : 'Copiar prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
