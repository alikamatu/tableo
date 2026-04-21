'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/stores/store';
import { initAuth } from '@/stores/authSlice';

/**
 * Placed inside Providers, runs initAuth exactly once.
 * Keeps the store in sync with the httpOnly cookie session.
 */
export function AuthInit() {
  const dispatch = useAppDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    dispatch(initAuth());
  }, [dispatch]);

  return null;
}
