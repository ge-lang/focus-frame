// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProviderWrapper } from '@/components/session-provider-wrapper';
import QueryProvider from '@/providers/query-provider';
import { DashboardProvider } from '@/contexts/dashboard-context'; // Добавьте импорт

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FocusFrame',
  description: 'Your Personal Productivity Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <QueryProvider>
            <DashboardProvider> {/* Оберните в DashboardProvider */}
              {children}
            </DashboardProvider>
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}