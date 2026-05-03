'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/stores/store';
import { PLANS } from '@/constants/landing-data';
import api from '@/lib/api';
import { useAlert } from '@/components/ui/Alert';

export default function SubscriptionPage() {
  const router = useRouter();
  const { show, node: alertNode } = useAlert();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);

  // We need the restaurant ID to apply the subscription to.
  // It should be in the onboarding state since they just finished onboarding.
  const { restaurantId } = useAppSelector((s) => s.onboarding);

  // If there's no restaurantId in state (e.g., page refresh), we could fetch it,
  // but for simplicity, we can fetch from /auth/me if needed, or /onboarding/state.
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(restaurantId);

  useEffect(() => {
    if (!activeRestaurantId) {
      setInitializing(true);
      // Fallback: try to fetch onboarding state to get the restaurant ID
      api
        .get('/onboarding/state')
        .then((res) => {
          if (res.data?.data?.restaurant?.id) {
            setActiveRestaurantId(res.data.data.restaurant.id);
          } else {
            // No restaurant found, go to dashboard fallback
            router.replace('/dashboard');
          }
        })
        .catch(() => router.replace('/dashboard'))
        .finally(() => setInitializing(false));
    }
  }, [activeRestaurantId, router]);

  const handleSelectPlan = async (planName: string) => {
    if (!activeRestaurantId) return;

    const plan = planName.toLowerCase() as 'starter' | 'pro' | 'business';
    setLoadingPlan(plan);

    try {
      if (plan === 'starter') {
        // Just go to dashboard, Starter is default and free
        router.replace('/dashboard');
      } else {
        // Start 1-month native free trial
        await api.post(`/restaurants/${activeRestaurantId}/subscription/trial`, { plan });
        router.replace('/dashboard');
      }
    } catch (err: any) {
      show('error', err.response?.data?.message || 'Failed to start trial. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen flex-col overflow-y-auto bg-bg pb-24 pt-12"
    >
      {alertNode}
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Choose your plan
          </h1>
          <p className="mx-auto max-w-xl text-muted">
            Your restaurant is ready! Select a plan to start taking orders. Paid plans include a{' '}
            <strong className="text-fg">1-month free trial</strong> — no credit card required today.
          </p>
        </div>

        {initializing ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isLoading = loadingPlan === plan.name.toLowerCase();
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`relative flex flex-col rounded-[32px] p-8 transition-all ${
                    plan.highlight ? 'bg-fg text-bg shadow-xl' : 'border border-border bg-surface'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
                  )}

                  <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${plan.highlight ? 'text-bg-muted' : 'text-muted'}`}
                      >
                        {plan.name}
                      </p>
                      {plan.highlight && (
                        <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span
                        className={`text-5xl font-black tracking-tight ${plan.highlight ? 'text-bg' : 'text-fg'}`}
                      >
                        GHS {plan.price}
                      </span>
                      <span
                        className={`text-sm font-medium ${plan.highlight ? 'text-bg/60' : 'text-muted'}`}
                      >
                        /mo
                      </span>
                    </div>

                    {plan.name !== 'Starter' && (
                      <p className="mt-2 text-sm font-semibold text-brand">1 Month Free Trial</p>
                    )}

                    <p
                      className={`mt-4 text-sm leading-relaxed ${plan.highlight ? 'text-bg/80' : 'text-muted'}`}
                    >
                      {plan.desc}
                    </p>
                  </div>

                  <div
                    className={`mb-8 h-px w-full ${plan.highlight ? 'bg-bg/10' : 'bg-border'}`}
                  />

                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm font-medium">
                        <div
                          className={`mt-0.5 shrink-0 rounded-full p-0.5 ${plan.highlight ? 'text-brand' : 'text-brand'}`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <span className={plan.highlight ? 'text-bg/90' : 'text-fg'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={!!loadingPlan}
                    className={`group flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      plan.highlight
                        ? 'bg-brand text-white hover:opacity-90'
                        : 'bg-fg text-bg hover:opacity-90'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {plan.name === 'Starter' ? 'Start for Free' : 'Start 1-Month Free Trial'}
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.replace('/dashboard')}
            className="text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            Skip for now, I'll choose later
          </button>
        </div>
      </div>
    </motion.div>
  );
}
