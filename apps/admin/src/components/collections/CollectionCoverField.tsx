'use client';

import { Crop } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminImageCropDialog } from '@/components/admin/AdminImageCropDialog';
import { AdminImageFilePicker } from '@/components/admin/AdminImageFilePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminToast } from '@/components/ui/admin-toast';
import { uploadAdminImageClient } from '@/lib/api/admin-media-client';

import { CollectionFieldHint } from './CollectionFieldHint';

const COVER_ASPECT = 4 / 3;
const COVER_OUTPUT_WIDTH = 1200;
const COVER_OUTPUT_HEIGHT = 900;

type CollectionCoverFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function CollectionCoverField({
  value,
  onChange,
  disabled = false,
}: CollectionCoverFieldProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
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
      adminToast.success('Capa da coleção enviada.');
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
        <span className="text-sm font-medium text-[var(--admin-navy)]">
          Capa da coleção <span className="text-[var(--admin-danger,#dc3545)]">*</span>
        </span>
        <CollectionFieldHint text="Imagem do slide na home (bloco Coleções curadas). Não aparece na landing de produtos." />
      </div>

      {trimmedValue !== '' ? (
        <img
          src={trimmedValue}
          alt="Pré-visualização da capa"
          className="aspect-[4/3] w-full max-w-[280px] rounded-md border border-[var(--admin-gray)] object-cover"
        />
      ) : null}

      <AdminImageFilePicker
        selectedFileName={selectedFileName}
        onFileChange={handleFileChange}
        disabled={disabled || uploading}
        hintLines={[
          'JPG, PNG, GIF ou WebP. Máximo 5 MiB.',
          'Recorte horizontal 4:3 (1200×900 px) para o carrossel da home.',
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

      <div className="pt-1">
        {!showUrlField ? (
          <button
            type="button"
            className="text-xs text-[var(--admin-navy)] underline-offset-2 hover:underline"
            onClick={() => setShowUrlField(true)}
            disabled={disabled}
          >
            Usar URL externa
          </button>
        ) : (
          <div className="space-y-2 rounded-lg border border-dashed border-[var(--admin-gray)] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--admin-navy)]">URL externa</span>
              <button
                type="button"
                className="text-xs text-[var(--admin-text-muted)] underline-offset-2 hover:underline"
                onClick={() => setShowUrlField(false)}
              >
                Ocultar
              </button>
            </div>
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="https://…"
              disabled={disabled}
            />
            <p className="text-xs text-[var(--admin-text-muted)]">
              Priorize imagens horizontais com licença adequada.
            </p>
          </div>
        )}
      </div>

      <AdminImageCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
        title="Recortar capa da coleção"
        description="Ajuste o enquadramento horizontal 4:3. A imagem final terá 1200×900 px."
        aspect={COVER_ASPECT}
        cropShape="rect"
        outputWidth={COVER_OUTPUT_WIDTH}
        outputHeight={COVER_OUTPUT_HEIGHT}
      />
    </div>
  );
}
