'use client';

import { ImageUp } from 'lucide-react';
import { useId, useRef } from 'react';

type AdminImageFilePickerProps = {
  label?: string;
  selectedFileName: string | null;
  onFileChange: (file: File | null) => void;
  hintLines: string[];
  disabled?: boolean;
};

export function AdminImageFilePicker({
  label = 'Carregar imagem',
  selectedFileName,
  onFileChange,
  hintLines,
  disabled = false,
}: AdminImageFilePickerProps): React.JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const labelId = `${inputId}-label`;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    onFileChange(file);
  }

  return (
    <div className="admin-image-file-picker-root">
      <span className="admin-image-sublabel" id={labelId}>
        {label}
      </span>

      <div className="admin-image-file-picker">
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="admin-image-file-input"
          onChange={handleChange}
          autoComplete="off"
          aria-labelledby={labelId}
          disabled={disabled}
        />
        <label htmlFor={inputId} className="admin-image-file-picker-button">
          <ImageUp className="size-4 shrink-0" aria-hidden="true" />
          Escolher arquivo
        </label>
        <span className="admin-image-file-picker-name" title={selectedFileName ?? undefined}>
          {selectedFileName ?? 'Nenhum arquivo selecionado'}
        </span>
      </div>

      <p className="admin-image-micro-hint">
        <span className="admin-image-micro-hint-icon" aria-hidden="true">
          <ImageUp className="size-3.5" />
        </span>
        <span className="admin-image-micro-hint-text">
          {hintLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </p>
    </div>
  );
}
