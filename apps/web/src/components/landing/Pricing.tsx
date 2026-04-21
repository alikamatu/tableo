'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PLANS } from '@/constants/landing-data';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function Pricing() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set('.p-card', { y: 10, opacity: 0 });

      // Create the animation
      gsap.to('.p-card', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.p-grid',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={ref} className="py-24 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold text-fg-muted uppercase tracking-[0.3em] mb-4">Investment</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-fg tracking-tight leading-tight">
            Simple pricing. Built for growth.
          </h2>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Choose a plan that fits your current needs and scale seamlessly as you expand
            your restaurant empire. No hidden fees. No surprises.
          </p>
        </div>

        <div className="p-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`p-card relative rounded-[40px] p-10 flex flex-col transition-all duration-500 hover:translate-y-[-8px] ${plan.highlight
                  ? 'bg-fg text-bg shadow-2xl shadow-black/20'
                  : 'bg-surface/50 border border-border/50 hover:border-border'
                }`}
            >
              {plan.highlight && (
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
              )}

              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${plan.highlight ? 'text-bg-muted' : 'text-muted'}`}>
                    {plan.name}
                  </p>
                  {plan.highlight && (
                    <span className="bg-brand text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-4">
                  <span className={`text-6xl font-black tracking-tighter ${plan.highlight ? 'text-bg' : 'text-fg'}`}>
                    GHS {plan.price}
                  </span>
                  <span className={`text-sm font-bold ${plan.highlight ? 'text-bg/60' : 'text-muted'}`}>/mo</span>
                </div>
                <p className={`text-sm mt-6 font-medium leading-relaxed ${plan.highlight ? 'text-bg/80' : 'text-fg-muted'}`}>
                  {plan.desc}
                </p>
              </div>

              <div className={`h-px w-full mb-10 ${plan.highlight ? 'bg-bg/10' : 'bg-border/50'}`} />

              <ul className="space-y-4 flex-1 mb-10">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-4 text-sm font-semibold tracking-tight">
                    <div className={`mt-0.5 shrink-0 rounded-full p-0.5 ${plan.highlight ? 'text-brand' : 'text-brand'}`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className={plan.highlight ? 'text-bg/90' : 'text-fg'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`group flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-sm font-bold transition-all active:scale-95 ${plan.highlight
                    ? 'bg-brand text-white hover:opacity-90'
                    : 'bg-fg text-bg hover:opacity-90'
                  }`}
              >
                {plan.cta}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
