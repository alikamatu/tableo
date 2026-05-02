'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/stores/store';
import { Toaster } from 'react-hot-toast';
import { SessionBootstrapper } from '@/components/auth/SessionBootstrapper';
import { InitAuth } from '@/components/auth/InitAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Suspense fallback={null}>
        <SessionBootstrapper />
        <InitAuth />
      </Suspense>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--surface))',
            color: 'hsl(var(--fg))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </Provider>
  );
}
