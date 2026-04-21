'use client';

import { Provider } from 'react-redux';
import { store } from '@/stores/store';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
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