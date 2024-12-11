import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BottomNav } from '@/components/bottom-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Liberdus',
  description: 'Liberdus web app',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background`} suppressHydrationWarning>
        <main className="min-h-screen max-w-md mx-auto bg-white">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}