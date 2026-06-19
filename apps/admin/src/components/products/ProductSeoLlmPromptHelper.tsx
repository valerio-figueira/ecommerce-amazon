'use client';

import { Check, Copy, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

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
import { buildCategoryPathLabel } from '@/lib/api/categories-utils';
import { useAdminCategoryOptions } from '@/hooks/useAdminCategoryOptions';
import type { ProductFormValues } from '@/lib/product-form-values';
import {
  buildProductSeoLlmPrompt,
  parseProductSeoLlmResponse,
} from '@/lib/product-llm-prompt';
import {
  buildProductMetaDescription,
  buildProductMetaTitle,
} from '@ecommerce-amazon/shared/seo';

const TOOLTIP_HINT =
  'Gerar Meta Title e Meta Description com prompt inteligente para LLM externa';

export function ProductSeoLlmPromptHelper(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const adminToast = useAdminToast();
  const categoryOptions = useAdminCategoryOptions();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [llmResponse, setLlmResponse] = useState('');

  const titleClean = useWatch({ control: form.control, name: 'titleClean' }) ?? '';
  const marketplace = useWatch({ control: form.control, name: 'marketplace' }) ?? 'amazon_br';
  const categoryId = useWatch({ control: form.control, name: 'categoryId' });
  const editorialScore = useWatch({ control: form.control, name: 'editorialScore' }) ?? 0;
  const pros = useWatch({ control: form.control, name: 'pros' }) ?? [];
  const cons = useWatch({ control: form.control, name: 'cons' }) ?? [];
  const shortDescription = useWatch({ control: form.control, name: 'shortDescription' }) ?? '';
  const specsNormalized = useWatch({ control: form.control, name: 'specsNormalized' }) ?? [];
  const metaTitle = useWatch({ control: form.control, name: 'metaTitle' }) ?? '';
  const metaDescription = useWatch({ control: form.control, name: 'metaDescription' }) ?? '';

  const categoryPathLabel = useMemo(
    () => buildCategoryPathLabel(categoryId, categoryOptions),
    [categoryId, categoryOptions],
  );

  const autoMetaTitle =
    titleClean.trim().length > 0 ? buildProductMetaTitle(titleClean) : '[Título automático]';
  const autoMetaDescription =
    titleClean.trim().length > 0
      ? buildProductMetaDescription(titleClean)
      : '[Descrição automática]';

  const prompt = useMemo(
    () =>
      buildProductSeoLlmPrompt({
        titleClean,
        marketplace,
        categoryPathLabel,
        editorialScore,
        pros,
        cons,
        shortDescription,
        specsNormalized,
        autoMetaTitle,
        autoMetaDescription,
        metaTitle,
        metaDescription,
      }),
    [
      autoMetaDescription,
      autoMetaTitle,
      categoryPathLabel,
      cons,
      editorialScore,
      marketplace,
      metaDescription,
      metaTitle,
      pros,
      shortDescription,
      specsNormalized,
      titleClean,
    ],
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
      const parsed = parseProductSeoLlmResponse(llmResponse);
      form.setValue('metaTitle', parsed.metaTitle, { shouldDirty: true, shouldValidate: true });
      form.setValue('metaDescription', parsed.metaDescription, {
        shouldDirty: true,
        shouldValidate: true,
      });
      adminToast.success('Meta Title e Meta Description aplicados. Revise os contadores antes de salvar.');
      setOpen(false);
      setLlmResponse('');
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Não foi possível aplicar a resposta.');
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          title={TOOLTIP_HINT}
          aria-label={TOOLTIP_HINT}
        >
          <Sparkles className="h-4 w-4" />
          Gerar SEO com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Meta Title e Description com IA</DialogTitle>
          <DialogDescription>
            O prompt já inclui título, categoria, prós, contras, specs e templates automáticos do
            produto. Copie na LLM externa, cole o JSON de volta e aplique nos campos de sobrescrita.
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
            htmlFor="product-seo-llm-response"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]"
          >
            2. Resposta da IA (JSON)
          </Label>
          <Textarea
            id="product-seo-llm-response"
            rows={5}
            value={llmResponse}
            onChange={(event) => setLlmResponse(event.target.value)}
            placeholder='{"metaTitle":"Cadeira Ergonômica DT3 | Análise e Ofertas","metaDescription":"Review honesto com prós, contras e onde comparar preço na Amazon. Curadoria editorial e monitoramento de ofertas."}'
            className="font-mono text-xs"
          />
          <p className="text-xs text-[var(--admin-text-muted)]">
            Aceita chaves <code className="text-[var(--admin-navy)]">metaTitle</code> /{' '}
            <code className="text-[var(--admin-navy)]">metaDescription</code> (ou{' '}
            <code className="text-[var(--admin-navy)]">seoTitle</code> /{' '}
            <code className="text-[var(--admin-navy)]">seoDescription</code>). Revise sempre antes de
            publicar.
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
