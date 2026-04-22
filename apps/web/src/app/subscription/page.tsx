'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/stores/store';
import { PLANS } from '@/constants/landing-data';
import api from '@/lib/api';
import { useAlert } from '@/components/ui/Alert';

export default function SubscriptionPage() {
  const router = useRouter();
  const { show, node: alertNode } = useAlert();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // We need the restaurant ID to apply the subscription to.
  // It should be in the onboarding state since they just finished onboarding.
  const { restaurantId } = useAppSelector((s) => s.onboarding);

  // If there's no restaurantId in state (e.g., page refresh), we could fetch it, 
  // but for simplicity, we can fetch from /auth/me if needed, or /onboarding/state.
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(restaurantId);

  useEffect(() => {
    if (!activeRestaurantId) {
      // Fallback: try to fetch onboarding state to get the restaurant ID
      api.get('/onboarding/state')
        .then((res) => {
          if (res.data?.data?.restaurant?.id) {
            setActiveRestaurantId(res.data.data.restaurant.id);
          } else {
            // No restaurant found, go to dashboard fallback
            router.replace('/restaurants');
          }
        })
        .catch(() => router.replace('/restaurants'));
    }
  }, [activeRestaurantId, router]);

  const handleSelectPlan = async (planName: string) => {
    if (!activeRestaurantId) return;
    
    const plan = planName.toLowerCase() as 'starter' | 'pro' | 'business';
    setLoadingPlan(plan);

    try {
      if (plan === 'starter') {
        // Just go to dashboard, Starter is default and free
        router.replace('/restaurants');
      } else {
        // Start 1-month native free trial
        await api.post(`/restaurants/${activeRestaurantId}/subscription/trial`, { plan });
        router.replace('/restaurants');
      }
    } catch (err: any) {
      show('error', err.response?.data?.message || 'Failed to start trial. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col pt-12 pb-24 overflow-y-auto">
      {alertNode}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-fg tracking-tight mb-3">
            Choose your plan
          </h1>
          <p className="text-muted max-w-xl mx-auto">
            Your restaurant is ready! Select a plan to start taking orders. 
            Paid plans include a <strong className="text-fg">1-month free trial</strong> — no credit card required today.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.name.toLowerCase();
            return (
              <div
                key={plan.name}
                className={`relative rounded-[32px] p-8 flex flex-col transition-all ${
                  plan.highlight
                    ? 'bg-fg text-bg shadow-xl'
                    : 'bg-surface border border-border'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
                )}

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className={`text-xs font-bold uppercase tracking-wider ${plan.highlight ? 'text-bg-muted' : 'text-muted'}`}>
                      {plan.name}
                    </p>
                    {plan.highlight && (
                      <span className="bg-brand text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-5xl font-black tracking-tight ${plan.highlight ? 'text-bg' : 'text-fg'}`}>
                      GHS {plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.highlight ? 'text-bg/60' : 'text-muted'}`}>/mo</span>
                  </div>
                  
                  {plan.name !== 'Starter' && (
                    <p className="text-brand font-semibold text-sm mt-2">1 Month Free Trial</p>
                  )}
                  
                  <p className={`text-sm mt-4 leading-relaxed ${plan.highlight ? 'text-bg/80' : 'text-muted'}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className={`h-px w-full mb-8 ${plan.highlight ? 'bg-bg/10' : 'bg-border'}`} />

                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium">
                      <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${plan.highlight ? 'text-brand' : 'text-brand'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className={plan.highlight ? 'text-bg/90' : 'text-fg'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={!!loadingPlan}
                  className={`group flex items-center justify-center gap-2 w-full h-12 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.replace('/restaurants')}
            className="text-sm font-medium text-muted hover:text-fg transition-colors"
          >
            Skip for now, I'll choose later
          </button>
        </div>
      </div>
    </div>
  );
}
