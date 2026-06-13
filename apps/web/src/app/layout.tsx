import { Geist, Geist_Mono } from 'next/font/google';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { AffiliateDisclaimer } from '@/components/layout/AffiliateDisclaimer';

import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Vitrine — Curadoria inteligente',
  description: 'Descubra ofertas selecionadas com histórico de preços e alertas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <SiteHeader />
          {children}
          <AffiliateDisclaimer />
        </Providers>
      </body>
    </html>
  );
}
