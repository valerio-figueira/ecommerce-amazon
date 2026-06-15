'use client';

import { Crop, ImageUp, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { ProfileAvatarCropDialog } from '@/components/profile/ProfileAvatarCropDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  removeOperatorAvatarClient,
  uploadOperatorAvatarClient,
} from '@/lib/api/profile-client';

type ProfileAvatarPanelProps = {
  initialAvatarUrl: string | null;
  initialIsManagedAvatar: boolean;
  displayName: string;
  email: string;
};

export function ProfileAvatarPanel({
  initialAvatarUrl,
  initialIsManagedAvatar,
  displayName,
  email,
}: ProfileAvatarPanelProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isManagedAvatar, setIsManagedAvatar] = useState(initialIsManagedAvatar);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const initial = useMemo(() => {
    const fromName = displayName.trim().charAt(0).toUpperCase();
    if (fromName) return fromName;
    return email.charAt(0).toUpperCase();
  }, [displayName, email]);

  const showManagedPhoto = Boolean(avatarUrl && isManagedAvatar);

  function setPhotoStatus(message: string, isError = false): void {
    setStatus({ message, isError });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFileName(null);
      return;
    }

    setSelectedFileName(file.name);
    setPhotoStatus('');

    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  }

  function handleOpenCrop(): void {
    if (!cropSrc) return;
    setCropOpen(true);
  }

  async function handleCropConfirm(blob: Blob): Promise<void> {
    setUploading(true);
    setPhotoStatus('Enviando foto…');
    try {
      const url = await uploadOperatorAvatarClient(blob);
      setAvatarUrl(url);
      setIsManagedAvatar(true);
      setSelectedFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setPhotoStatus('Foto atualizada com sucesso.');
      adminToast.success('Foto de perfil atualizada.');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar foto';
      setPhotoStatus(message, true);
      adminToast.error(message);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto(): Promise<void> {
    setRemoving(true);
    try {
      await removeOperatorAvatarClient();
      setAvatarUrl(null);
      setIsManagedAvatar(false);
      setPhotoStatus('Foto removida.');
      adminToast.success('Foto de perfil removida.');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao remover foto';
      setPhotoStatus(message, true);
      adminToast.error(message);
    } finally {
      setRemoving(false);
      setRemoveOpen(false);
    }
  }

  return (
    <>
      <aside className="admin-profile-photo-column" aria-label="Foto de perfil">
        <p className="admin-profile-photo-heading">Foto de perfil</p>

        <div className="admin-profile-avatar-ring">
          <div className="admin-profile-avatar-inner">
            {showManagedPhoto ? (
              <img
                src={avatarUrl ?? ''}
                alt=""
                width={136}
                height={136}
                className="admin-profile-photo-preview"
                decoding="async"
              />
            ) : (
              <div className="admin-profile-avatar-placeholder" aria-hidden="true">
                <span className="admin-profile-avatar-placeholder-letter">{initial}</span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-profile-photo-toolbar">
          <span className="admin-profile-sublabel" id="admin-profile-photo-file-label">
            Carregar imagem
          </span>

          <div className="admin-profile-file-picker">
            <input
              ref={fileInputRef}
              id="admin-profile-photo-file"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="admin-profile-file-input"
              onChange={handleFileChange}
              autoComplete="off"
              aria-labelledby="admin-profile-photo-file-label"
            />
            <label htmlFor="admin-profile-photo-file" className="admin-profile-file-picker-button">
              <ImageUp className="size-4 shrink-0" aria-hidden="true" />
              Escolher arquivo
            </label>
            <span className="admin-profile-file-picker-name" title={selectedFileName ?? undefined}>
              {selectedFileName ?? 'Nenhum arquivo selecionado'}
            </span>
          </div>

          <p className="admin-profile-micro-hint">
            <span className="admin-profile-micro-hint-icon" aria-hidden="true">
              <ImageUp className="size-3.5" />
            </span>
            <span className="admin-profile-micro-hint-text">
              <span>JPG, PNG, GIF ou WebP. Máximo <strong>5 MiB</strong>.</span>
              <span>Recorte quadrado até 512×512 px.</span>
            </span>
          </p>

          <div className="admin-profile-photo-actions">
            <Button
              type="button"
              onClick={handleOpenCrop}
              disabled={!cropSrc || uploading}
            >
              <Crop className="size-4" aria-hidden="true" />
              Recortar e aplicar
            </Button>
            {showManagedPhoto ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setRemoveOpen(true)}
                disabled={removing}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remover foto
              </Button>
            ) : null}
          </div>
        </div>

        <p
          className={`admin-profile-status${status ? ' is-visible' : ''}${status?.isError ? ' is-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status?.message ?? ''}
        </p>
      </aside>

      <ProfileAvatarCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={setCropOpen}
        onConfirm={handleCropConfirm}
      />

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              A foto atual será excluída do armazenamento gerenciado. Você pode enviar outra imagem depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleRemovePhoto()} disabled={removing}>
              {removing ? 'Removendo…' : 'Remover foto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
