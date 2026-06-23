'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  computeMaxZoomForCrop,
  computeMinZoomToFitMedia,
  getCroppedImageBlob,
} from '@/lib/admin-image-crop';

type AdminImageCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blob: Blob) => Promise<void>;
  title: string;
  description: string;
  aspect: number;
  cropShape?: 'round' | 'rect';
  outputWidth: number;
  outputHeight: number;
};

export function AdminImageCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
  title,
  description,
  aspect,
  cropShape = 'rect',
  outputWidth,
  outputHeight,
}: AdminImageCropDialogProps): React.JSX.Element {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(8);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open || !imageSrc) {
      return;
    }

    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setMaxZoom(8);
    setCroppedAreaPixels(null);
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const onMediaLoaded = useCallback(
    (mediaSize: { width: number; height: number }) => {
      const nextMinZoom = computeMinZoomToFitMedia(aspect, mediaSize.width, mediaSize.height);
      const nextMaxZoom = computeMaxZoomForCrop(nextMinZoom);
      setMinZoom(nextMinZoom);
      setMaxZoom(nextMaxZoom);
      setZoom(nextMinZoom);
      setCrop({ x: 0, y: 0 });
    },
    [aspect],
  );

  async function handleApply(): Promise<void> {
    if (!imageSrc || !croppedAreaPixels) return;

    setApplying(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        width: outputWidth,
        height: outputHeight,
      });
      await onConfirm(blob);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="admin-image-crop-wrap relative h-80 overflow-hidden rounded-lg bg-[color:var(--admin-bg)] sm:h-96">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              objectFit="contain"
              minZoom={minZoom}
              maxZoom={maxZoom}
              restrictPosition={false}
              showGrid={cropShape === 'rect'}
              style={{
                containerStyle: { backgroundColor: '#ffffff' },
              }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              onMediaLoaded={onMediaLoaded}
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-xs font-medium text-[color:var(--admin-text-muted)]"
            htmlFor="admin-image-crop-zoom"
          >
            Zoom
          </label>
          <input
            id="admin-image-crop-zoom"
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-[color:var(--admin-primary)]"
          />
          <p className="text-xs text-[color:var(--admin-text-muted)]">
            Afaste ao máximo para incluir a foto inteira; aproxime para destacar detalhes.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleApply()} disabled={applying || !imageSrc}>
            {applying ? 'Aplicando…' : 'Aplicar recorte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
