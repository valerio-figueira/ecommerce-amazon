import { Suspense } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

import { buildRootMetadata } from '@ecommerce-amazon/shared/seo';
import type { Metadata, Viewport } from 'next';

import { SiteHeaderShell } from '@/components/layout/SiteHeaderShell';
import { Footer } from '@/components/layout/Footer';
import { HeaderSkeleton } from '@/components/loading/HeaderSkeleton';
import { NavigationPendingBar } from '@/components/navigation/NavigationPendingBar';
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

export const metadata: Metadata = {
  ...buildRootMetadata(getServerBrandConfig()),
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
          <Suspense fallback={null}>
            <NavigationPendingBar />
          </Suspense>
          <div className="flex min-h-screen flex-col">
            <Suspense fallback={<HeaderSkeleton />}>
              <SiteHeaderShell />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
