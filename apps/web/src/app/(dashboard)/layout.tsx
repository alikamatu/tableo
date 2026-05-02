'use client';

import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { VerificationBanner } from '@/components/shared/VerificationBanner';
import { useRestaurant } from '@/hooks/use-restaurant';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useRestaurant(); // Initialize restaurant fetching globally for the dashboard

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-bg">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={[
            'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out',
            'lg:static lg:flex lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <Sidebar />
        </div>

        {/* Right pane */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Email verification banner — shows only when email unverified */}
          <VerificationBanner />
          <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
