import { formatCopyrightNotice } from '@ecommerce-amazon/shared/config/brand';
import Link from 'next/link';

import { getServerBrandConfig } from '@/lib/site-url';

export function Footer(): React.JSX.Element {
  const brand = getServerBrandConfig();

  return (
    <footer className="border-t border-gray-100 py-6 text-center text-xs font-normal tracking-wide text-gray-400">
      <p>
        {formatCopyrightNotice(brand, new Date().getFullYear())}{' '}
        <Link
          href="/legal"
          className="underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-500 hover:decoration-gray-400"
        >
          Políticas de Privacidade e Termos de Uso
        </Link>
      </p>
    </footer>
  );
}
