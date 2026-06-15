'use client';

import { useCallback, useState } from 'react';
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
import { getCroppedAvatarBlob } from '@/lib/profile-avatar-crop';

type ProfileAvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blob: Blob) => Promise<void>;
};

export function ProfileAvatarCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onConfirm,
}: ProfileAvatarCropDialogProps): React.JSX.Element {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleApply(): Promise<void> {
    if (!imageSrc || !croppedAreaPixels) return;

    setApplying(true);
    try {
      const blob = await getCroppedAvatarBlob(imageSrc, croppedAreaPixels);
      await onConfirm(blob);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Recortar foto de perfil</DialogTitle>
          <DialogDescription>
            Ajuste o enquadramento quadrado. A imagem final terá até 512×512 px.
          </DialogDescription>
        </DialogHeader>

        <div className="admin-profile-crop-wrap relative h-72 overflow-hidden rounded-lg bg-[color:var(--admin-bg)]">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[color:var(--admin-text-muted)]" htmlFor="profile-crop-zoom">
            Zoom
          </label>
          <input
            id="profile-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-[color:var(--admin-primary)]"
          />
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
