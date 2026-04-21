import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/shared/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Tableo | Advanced Digital Menu & Restaurant Management',
    template: '%s | Tableo',
  },
  description: 'Transform your restaurant with Tableo. Premium QR menus, real-time order tracking, and multi-branch analytics. Built for modern dining in Ghana.',
  keywords: ['digital menu', 'QR ordering', 'restaurant management SaaS', 'Ghana fine dining', 'order tracking system'],
  openGraph: {
    title: 'Tableo | Advanced Digital Menu Management',
    description: 'The future of restaurant operations in Ghana. QR menus, analytics, and more.',
    type: 'website',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * suppressHydrationWarning is required because next-themes adds the .dark
     * class server-side when it detects the system preference, and React would
     * otherwise warn about a className mismatch on hydration.
     */
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-bg font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
