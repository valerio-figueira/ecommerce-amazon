'use client';

import { ArrowDown, ArrowUp, Crop, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { AdminImageCropDialog } from '@/components/admin/AdminImageCropDialog';
import { AdminImageFilePicker } from '@/components/admin/AdminImageFilePicker';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { ProductFormLabelRow } from '@/components/products/ProductFormLabelRow';
import { ProductThumbnail } from '@/components/products/ProductThumbnail';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { uploadAdminImageClient } from '@/lib/api/admin-media-client';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';

const IMAGE_ASPECT = 4 / 3;
const IMAGE_OUTPUT_WIDTH = 1200;
const IMAGE_OUTPUT_HEIGHT = 900;

export function ProductImagesSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const adminToast = useAdminToast();
  const images = form.watch('images') ?? [];

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    return () => {
      if (cropSrc) {
        URL.revokeObjectURL(cropSrc);
      }
    };
  }, [cropSrc]);

  function setImages(next: string[]): void {
    form.setValue('images', next, { shouldDirty: true });
  }

  function setImageStatus(message: string, isError = false): void {
    setStatus({ message, isError });
  }

  function handleFileChange(file: File | null): void {
    if (!file) {
      setSelectedFileName(null);
      return;
    }

    setSelectedFileName(file.name);
    setImageStatus('');

    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }

    setCropSrc(URL.createObjectURL(file));
  }

  function handleOpenCrop(): void {
    if (!cropSrc) return;
    setCropOpen(true);
  }

  async function handleCropConfirm(blob: Blob): Promise<void> {
    setUploading(true);
    setImageStatus('Enviando imagem…');
    try {
      const url = await uploadAdminImageClient(blob);
      setImages([...images, url]);
      setSelectedFileName(null);
      setImageStatus('Imagem adicionada à galeria.');
      adminToast.success('Imagem do produto enviada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar imagem';
      setImageStatus(message, true);
      adminToast.error(message);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number): void {
    setImages(images.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(from: number, to: number): void {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    if (item === undefined) return;
    next.splice(to, 0, item);
    setImages(next);
  }

  function handleAddExternalUrl(): void {
    const trimmed = externalUrl.trim();
    if (!trimmed) {
      adminToast.error('Informe a URL da imagem.');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        adminToast.error('Use uma URL HTTPS válida.');
        return;
      }
    } catch {
      adminToast.error('URL inválida.');
      return;
    }

    setImages([...images, trimmed]);
    setExternalUrl('');
    setImageStatus('URL adicionada à galeria.');
    adminToast.success('Imagem adicionada por URL.');
  }

  return (
    <CmsFormSection title="Galeria de imagens">
      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.images}>
              <FormLabel>Imagens do produto</FormLabel>
            </ProductFormLabelRow>
            <FormDescription>
              Envie arquivos com recorte horizontal ou cole URLs HTTPS do marketplace ou CDN.
            </FormDescription>

            <div className="space-y-4 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-4">
              <AdminImageFilePicker
                selectedFileName={selectedFileName}
                onFileChange={handleFileChange}
                disabled={uploading}
                hintLines={[
                  'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
                  'Recorte horizontal 4:3 (1200×900 px). Afaste o zoom se a foto for cortada.',
                ]}
              />

              <Button
                type="button"
                onClick={handleOpenCrop}
                disabled={!cropSrc || uploading}
                className="w-full sm:w-auto"
              >
                <Crop className="size-4" aria-hidden="true" />
                Recortar e enviar
              </Button>

              <p
                className={`admin-image-status${status ? ' is-visible' : ''}${status?.isError ? ' is-error' : ''}`}
                role="status"
                aria-live="polite"
              >
                {status?.message ?? ''}
              </p>

              {!showUrlField ? (
                <button
                  type="button"
                  className="text-xs text-[var(--admin-navy)] underline-offset-2 hover:underline"
                  onClick={() => setShowUrlField(true)}
                >
                  Adicionar por URL
                </button>
              ) : (
                <div className="space-y-2 rounded-lg border border-dashed border-[var(--admin-gray)] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--admin-navy)]">
                      URL externa
                    </span>
                    <button
                      type="button"
                      className="text-xs text-[var(--admin-text-muted)] underline-offset-2 hover:underline"
                      onClick={() => setShowUrlField(false)}
                    >
                      Ocultar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={externalUrl}
                      onChange={(event) => setExternalUrl(event.target.value)}
                      placeholder="https://…"
                    />
                    <Button type="button" variant="outline" onClick={handleAddExternalUrl}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--admin-text-muted)]">
                    Cole URLs HTTPS de imagens do marketplace ou CDN com licença adequada.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {images.length === 0 ? (
                <p className="text-xs text-[var(--admin-text-muted)]">
                  Nenhuma imagem. Envie arquivos ou cole URLs HTTPS.
                </p>
              ) : (
                images.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-surface)] p-2"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-navy)] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <ProductThumbnail src={imageUrl} alt={`Imagem ${index + 1}`} size="xs" />
                    <span
                      className="min-w-0 flex-1 truncate text-xs text-[var(--admin-text-muted)]"
                      title={imageUrl}
                    >
                      {imageUrl}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                        aria-label="Mover para cima"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === images.length - 1}
                        onClick={() => move(index, index + 1)}
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAt(index)}
                        aria-label="Remover imagem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <FormMessage />
          </FormItem>
        )}
      />

      <AdminImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
        title="Recortar imagem do produto"
        description="Ajuste o enquadramento 4:3. Afaste o zoom para incluir a imagem inteira quando necessário."
        aspect={IMAGE_ASPECT}
        cropShape="rect"
        outputWidth={IMAGE_OUTPUT_WIDTH}
        outputHeight={IMAGE_OUTPUT_HEIGHT}
      />
    </CmsFormSection>
  );
}
