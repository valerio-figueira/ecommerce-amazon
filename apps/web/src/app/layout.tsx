import { Geist, Geist_Mono } from 'next/font/google';

import { formatWebHomeTitle } from '@ecommerce-amazon/shared/config/brand';

import { SiteHeaderShell } from '@/components/layout/SiteHeaderShell';
import { Footer } from '@/components/layout/Footer';
import { getServerBrandConfig } from '@/lib/site-url';

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

const brand = getServerBrandConfig();

export const metadata = {
  title: formatWebHomeTitle(brand),
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
          <div className="flex min-h-screen flex-col">
            <SiteHeaderShell />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
