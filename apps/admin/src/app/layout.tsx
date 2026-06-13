import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { AdminAppProviders } from '@/components/admin/AdminAppProviders';

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
  title: 'Vitrine — Painel CMS',
  description: 'Painel administrativo interno da vitrine',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AdminAppProviders>{children}</AdminAppProviders>
      </body>
    </html>
  );
}
