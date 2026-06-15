'use client';

import { useEffect } from 'react';

import { ServerErrorContent } from '@/components/errors/ServerErrorContent';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console -- dev-only error logging
      console.error('[ErrorPage]', error);
    }
  }, [error]);

  return <ServerErrorContent onRetry={reset} />;
}
