'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

type CopyComparisonLinkButtonProps = {
  url: string;
};

export function CopyComparisonLinkButton({
  url,
}: CopyComparisonLinkButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={() => void handleCopy()}>
      {copied ? 'Link copiado' : 'Copiar link'}
    </Button>
  );
}
