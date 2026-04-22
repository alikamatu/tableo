'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { markSession } from '@/lib/tokens';

export function SessionBootstrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (searchParams?.get('authenticated') === 'true') {
      // Mark session so that Redux initAuth picks up the cookie-based session
      markSession();

      // Clean the URL without causing a full page reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('authenticated');

      const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [mounted, searchParams, pathname]);

  return null;
}
