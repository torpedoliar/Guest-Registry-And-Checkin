import './globals.css';
import type { ReactNode } from 'react';
import TopNav from '../components/TopNav';
import ThemeBackground from '../components/ThemeBackground';

export const metadata = {
  title: 'Guest Registry',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeBackground />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
