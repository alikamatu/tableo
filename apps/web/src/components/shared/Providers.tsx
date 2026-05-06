'use client';

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { store } from '@/stores/store';
import { SessionBootstrapper } from '@/components/auth/SessionBootstrapper';
import { InitAuth } from '@/components/auth/InitAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/*
       * attribute="class"  → adds/removes .dark on <html>
       * defaultTheme="system" → follows OS preference on first visit
       * enableSystem       → allows "system" as a valid theme value
       * disableTransitionOnChange → no flash when toggling
       */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Suspense fallback={null}>
          <SessionBootstrapper />
          <InitAuth />
        </Suspense>
        {children}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--surface))',
              color: 'hsl(var(--fg))',
              borderRadius: 'var(--radius)',
              fontSize: '13px',
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
              border: 'none',
              maxWidth: '360px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: 'white' },
            },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}
