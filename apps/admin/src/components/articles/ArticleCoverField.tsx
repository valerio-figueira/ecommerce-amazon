'use client';

import { Crop } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ArticleFieldHint } from '@/components/articles/ArticleFieldHint';
import { AdminImageCropDialog } from '@/components/admin/AdminImageCropDialog';
import { AdminImageFilePicker } from '@/components/admin/AdminImageFilePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { useAdminToast } from '@/components/ui/admin-toast';
import { uploadAdminImageClient } from '@/lib/api/admin-media-client';

const COVER_ASPECT = 16 / 9;
const COVER_OUTPUT_WIDTH = 1200;
const COVER_OUTPUT_HEIGHT = 675;

type ArticleCoverFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function ArticleCoverField({
  value,
  onChange,
  disabled = false,
}: ArticleCoverFieldProps): React.JSX.Element {
  const adminToast = useAdminToast();
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

  function setCoverStatus(message: string, isError = false): void {
    setStatus({ message, isError });
  }

  function handleFileChange(file: File | null): void {
    if (!file) {
      setSelectedFileName(null);
      return;
    }

    setSelectedFileName(file.name);
    setCoverStatus('');

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
    setCoverStatus('Enviando capa…');
    try {
      const url = await uploadAdminImageClient(blob);
      onChange(url);
      setSelectedFileName(null);
      setCoverStatus('Capa enviada com sucesso.');
      adminToast.success('Capa do artigo enviada.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar capa';
      setCoverStatus(message, true);
      adminToast.error(message);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  const trimmedValue = value.trim();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="article-cover">
          Capa{' '}
          <span className="font-normal text-[var(--admin-text-muted)]">(opcional)</span>
        </Label>
        <ArticleFieldHint text="Banner horizontal (16:9 ou 21:9) no topo da página e no bloco Bento quando não houver override no CMS." />
      </div>

      {trimmedValue !== '' ? (
        <ManagedImage
          src={trimmedValue}
          alt="Pré-visualização da capa"
          className="aspect-video w-full max-w-[280px] rounded-md border border-[var(--admin-gray)] object-cover"
        />
      ) : null}

      <AdminImageFilePicker
        selectedFileName={selectedFileName}
        onFileChange={handleFileChange}
        disabled={disabled || uploading}
        hintLines={[
          'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
          'Recorte horizontal 16:9 (1200×675 px) para banner do artigo.',
        ]}
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
          id="article-cover"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…"
          disabled={disabled}
        />
        <p className="text-xs text-[var(--admin-text-muted)]">
          Priorize imagens horizontais, nítidas e com licença adequada (ex.: Pexels).
        </p>
      </div>

      <AdminImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
        title="Recortar capa do artigo"
        description="Ajuste o enquadramento horizontal 16:9. A imagem final terá 1200×675 px."
        aspect={COVER_ASPECT}
        cropShape="rect"
        outputWidth={COVER_OUTPUT_WIDTH}
        outputHeight={COVER_OUTPUT_HEIGHT}
      />
    </div>
  );
}
