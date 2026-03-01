import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Giro Jeri | Passeios e Translados',
  description: 'Agende passeios privativos, compartilhados e translados em Jericoacoara com facilidade e segurança.',
  manifest: '/manifest.json',
  themeColor: '#1d5ed8',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="container">
          <main>{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
