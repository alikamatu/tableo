'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { VerificationBanner } from '@/components/shared/VerificationBanner';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { setCurrentBranch } from '@/stores/branchSlice';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);

  // Auto-select the manager's branch on load
  useEffect(() => {
    if (user?.staffMember?.branchId && (!branch || branch.id !== user.staffMember.branchId)) {
      dispatch(setCurrentBranch({
        id: user.staffMember.branchId,
        name: user.staffMember.branch.name,
        restaurantId: user.staffMember.branch.restaurantId,
        slug: '', // We don't have the slug here but it's fine for context
        isActive: true,
      } as any));
    }
  }, [user?.staffMember, branch, dispatch]);

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
          <Sidebar mode="manager" />
        </div>

        {/* Right pane */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <VerificationBanner />
          <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} mode="manager" />
          <main className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-7">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}
