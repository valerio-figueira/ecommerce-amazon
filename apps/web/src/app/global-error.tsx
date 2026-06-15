'use client';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps): React.JSX.Element {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console -- dev-only error logging
    console.error('[GlobalErrorPage]', error);
  }

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          background: '#f7f7f7',
          color: '#111111',
        }}
      >
        <main
          style={{
            margin: '0 auto',
            maxWidth: '32rem',
            padding: '4rem 1rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#a3a3a3',
            }}
          >
            Erro crítico
          </p>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Algo deu errado</h1>
          <p style={{ marginTop: '1rem', lineHeight: 1.6, color: '#525252' }}>
            Não foi possível carregar a vitrine. Tente recarregar a página.
          </p>
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: 'pointer',
                border: 'none',
                borderRadius: '9999px',
                background: '#111111',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '9999px',
                border: '1px solid #d4d4d4',
                background: '#ffffff',
                color: '#111111',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Ir para a home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
