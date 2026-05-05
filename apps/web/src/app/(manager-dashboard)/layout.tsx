'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { setCurrentBranch } from '@/stores/branchSlice';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ManagerSidebar } from '@/components/manager/ManagerSidebar';
import { ManagerTopbar } from '@/components/manager/ManagerTopbar';
import { VerificationBanner } from '@/components/shared/VerificationBanner';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { current: branch } = useAppSelector((s) => s.branch);

  useEffect(() => {
    const sm = user?.staffMember;
    if (sm?.branchId && (!branch || branch.id !== sm.branchId)) {
      dispatch(
        setCurrentBranch({
          id: sm.branchId,
          name: sm.branch.name,
          restaurantId: sm.branch.restaurantId,
          slug: '',
          isActive: true,
        } as never),
      );
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
          <ManagerSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <VerificationBanner />
          <ManagerTopbar onToggle={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
