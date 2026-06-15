'use client';

import { AdminImageCropDialog } from '@/components/admin/AdminImageCropDialog';

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
  return (
    <AdminImageCropDialog
      open={open}
      imageSrc={imageSrc}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Recortar foto de perfil"
      description="Ajuste o enquadramento quadrado. A imagem final terá até 512×512 px."
      aspect={1}
      cropShape="round"
      outputWidth={512}
      outputHeight={512}
    />
  );
}
