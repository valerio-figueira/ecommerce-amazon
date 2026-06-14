import Link from 'next/link';

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-gray-100 py-6 text-center text-xs font-normal tracking-wide text-gray-400">
      <p>
        © 2026 Vitrine. Todos os direitos reservados.{' '}
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
