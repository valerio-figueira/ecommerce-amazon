'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type MaskedSecretInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function MaskedSecretInput({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
}: MaskedSecretInputProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setVisible((current) => !current)}
        disabled={disabled}
        aria-label={visible ? 'Ocultar segredo' : 'Mostrar segredo'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
