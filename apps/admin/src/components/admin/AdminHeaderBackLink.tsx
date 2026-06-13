import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function AdminHeaderBackLink() {
  return (
    <Link
      href="/"
      className="backward-link inline-flex items-center justify-center rounded-md p-1 text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-bg)]"
      aria-label="Voltar para o painel"
      title="Voltar"
    >
      <ChevronRight className="size-5 rotate-180" />
    </Link>
  );
}
