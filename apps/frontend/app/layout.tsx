import './globals.css';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import TopNav from '../components/TopNav';
import ThemeBackground from '../components/ThemeBackground';
import { SSEProvider } from '../lib/sse-context';
import { QueryProvider } from '../lib/query-provider';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const metadata = {
  title: 'Event Management System',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <SSEProvider>
              <ThemeBackground />
              <Suspense fallback={<div className="h-14 w-full bg-slate-900/80" />}>
                <TopNav />
              </Suspense>
              {children}
            </SSEProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
