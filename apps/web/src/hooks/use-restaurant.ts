'use client';

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import {
  fetchRestaurants,
  setCurrent,
} from '@/stores/restaurantSlice';
import { fetchBranches, setCurrentBranch, clearBranches } from '@/stores/branchSlice';

export function useRestaurant() {
  const dispatch = useAppDispatch();
  const { restaurants, current, loading, error } = useAppSelector((s) => s.restaurant);
  const { user } = useAppSelector((s) => s.auth);

  // Auto-fetch restaurants when user is available
  useEffect(() => {
    if (user && restaurants.length === 0 && !loading) {
      dispatch(fetchRestaurants());
    }
  }, [dispatch, user, restaurants.length, loading]);

  // Auto-fetch branches when restaurant changes
  useEffect(() => {
    if (current?.id) {
      dispatch(fetchBranches(current.id));
    } else {
      dispatch(clearBranches());
    }
  }, [dispatch, current?.id]);

  const selectRestaurant = useCallback(
    (id: string) => {
      const r = restaurants.find((r) => r.id === id);
      if (r) dispatch(setCurrent(r));
    },
    [dispatch, restaurants],
  );

  return {
    restaurants,
    current,
    loading,
    error,
    selectRestaurant,
  };
}
