import type { Metadata } from 'next';

import { resolveApiBaseUrl } from '@/lib/api/resolve-api-base-url';
import { getServerBrandConfig } from '@/lib/site-url';

type CancelAlertPageProps = {
  params: Promise<{ token: string }>;
};

async function cancelPriceAlert(token: string): Promise<'success' | 'invalid'> {
  const response = await fetch(`${resolveApiBaseUrl()}/price-alerts/${encodeURIComponent(token)}`, {
    method: 'DELETE',
    cache: 'no-store',
  });

  if (response.status === 204) {
    return 'success';
  }

  return 'invalid';
}

export function generateMetadata(): Metadata {
  return {
    title: 'Cancelar alerta de preço',
    robots: { index: false, follow: false },
  };
}

export default async function CancelPriceAlertPage({
  params,
}: CancelAlertPageProps): Promise<React.JSX.Element> {
  const { token } = await params;
  const brand = getServerBrandConfig();
  const result = await cancelPriceAlert(token);

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      {result === 'success' ? (
        <>
          <h1 className="text-2xl font-bold">Alerta cancelado</h1>
          <p className="mt-4 text-neutral-600">
            Você não receberá mais e-mails sobre este alerta de preço. Se mudar de ideia, crie um
            novo alerta na página do produto em {brand.name}.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Link inválido ou expirado</h1>
          <p className="mt-4 text-neutral-600">
            Não encontramos este alerta para cancelamento. Ele pode já ter sido disparado, cancelado
            ou o link pode estar incorreto.
          </p>
        </>
      )}
    </main>
  );
}
