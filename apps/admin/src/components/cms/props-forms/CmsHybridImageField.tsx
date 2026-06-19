'use client';

import { Crop } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminImageCropDialog } from '@/components/admin/AdminImageCropDialog';
import { AdminImageFilePicker } from '@/components/admin/AdminImageFilePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { useAdminToast } from '@/components/ui/admin-toast';
import { uploadAdminImageClient } from '@/lib/api/admin-media-client';
import { cn } from '@/lib/utils';

export const CMS_IMAGE_PRESETS = {
  heroSlide: {
    aspect: 3 / 2,
    outputWidth: 1200,
    outputHeight: 800,
    previewClassName: 'aspect-[3/2]',
    hintLines: [
      'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
      'Recorte horizontal 3:2 (1200×800 px) para slides do carrossel.',
    ],
    cropTitle: 'Recortar imagem do slide',
    cropDescription: 'Ajuste o enquadramento 3:2. A imagem final terá 1200×800 px.',
  },
  banner: {
    aspect: 2 / 1,
    outputWidth: 1200,
    outputHeight: 600,
    previewClassName: 'aspect-[2/1]',
    hintLines: [
      'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
      'Recorte horizontal 2:1 (1200×600 px) para o banner.',
    ],
    cropTitle: 'Recortar imagem do banner',
    cropDescription: 'Ajuste o enquadramento 2:1. A imagem final terá 1200×600 px.',
  },
  bentoTile: {
    aspect: 1,
    outputWidth: 800,
    outputHeight: 800,
    previewClassName: 'aspect-square',
    hintLines: [
      'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
      'Recorte quadrado 1:1 (800×800 px) para cards da grade.',
    ],
    cropTitle: 'Recortar imagem do card',
    cropDescription: 'Ajuste o enquadramento quadrado. A imagem final terá 800×800 px.',
  },
  coverWide: {
    aspect: 16 / 9,
    outputWidth: 1200,
    outputHeight: 675,
    previewClassName: 'aspect-video',
    hintLines: [
      'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
      'Recorte horizontal 16:9 (1200×675 px) para capa em destaque.',
    ],
    cropTitle: 'Recortar imagem de capa',
    cropDescription: 'Ajuste o enquadramento 16:9. A imagem final terá 1200×675 px.',
  },
} as const;

export type CmsImagePresetKey = keyof typeof CMS_IMAGE_PRESETS;

type CmsHybridImageFieldProps = {
  value: string;
  onChange: (url: string) => void;
  preset: CmsImagePresetKey;
  disabled?: boolean;
  urlPlaceholder?: string;
  urlDescription?: string;
  inputId?: string;
};

export function CmsHybridImageField({
  value,
  onChange,
  preset,
  disabled = false,
  urlPlaceholder = 'https://…',
  urlDescription = 'Ou cole a URL de uma imagem externa com licença adequada.',
  inputId,
}: CmsHybridImageFieldProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const presetConfig = CMS_IMAGE_PRESETS[preset];

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);

  useEffect(() => {
    return () => {
      if (cropSrc) {
        URL.revokeObjectURL(cropSrc);
      }
    };
  }, [cropSrc]);

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
      onChange(url);
      setSelectedFileName(null);
      setImageStatus('Imagem enviada com sucesso.');
      adminToast.success('Imagem enviada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar imagem';
      setImageStatus(message, true);
      adminToast.error(message);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  const trimmedValue = value.trim();

  return (
    <div className="space-y-3">
      {trimmedValue !== '' ? (
        <ManagedImage
          src={trimmedValue}
          alt="Pré-visualização da imagem"
          className={cn(
            'w-full max-w-[280px] rounded-md border border-[var(--admin-gray)] object-cover',
            presetConfig.previewClassName,
          )}
        />
      ) : null}

      <AdminImageFilePicker
        selectedFileName={selectedFileName}
        onFileChange={handleFileChange}
        disabled={disabled || uploading}
        hintLines={[...presetConfig.hintLines]}
      />

      <Button
        type="button"
        onClick={handleOpenCrop}
        disabled={!cropSrc || uploading || disabled}
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

      <div className="space-y-2 rounded-lg border border-dashed border-[var(--admin-gray)] px-4 py-3">
        <span className="text-xs font-semibold text-[var(--admin-navy)]">URL da imagem</span>
        <Input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={urlPlaceholder}
          disabled={disabled}
        />
        <p className="text-xs text-[var(--admin-text-muted)]">{urlDescription}</p>
      </div>

      <AdminImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
        title={presetConfig.cropTitle}
        description={presetConfig.cropDescription}
        aspect={presetConfig.aspect}
        cropShape="rect"
        outputWidth={presetConfig.outputWidth}
        outputHeight={presetConfig.outputHeight}
      />
    </div>
  );
}
