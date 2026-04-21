'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STEPS } from '@/constants/landing-data';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.how-step', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.how-grid',
          start: 'top 85%',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-bg border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-20">
          <p className="text-[10px] font-bold text-fg-muted uppercase tracking-[0.3em] mb-4">Process</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-fg tracking-tight leading-tight max-w-2xl">
            Up and running in under 10 minutes.
          </h2>
        </div>

        <div className="how-grid grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="how-step group">
                <div className="relative mb-8">
                  <div className="text-[100px] font-black text-fg/[0.03] absolute -top-12 -left-4 select-none group-hover:text-brand/[0.05] transition-colors duration-700">
                    {step.n}
                  </div>
                  <div className="relative z-10 h-12 w-12 rounded-2xl bg-surface border border-border/50 flex items-center justify-center shadow-lg shadow-black/[0.02] group-hover:scale-110 group-hover:border-brand/20 transition-all duration-500">
                    <Icon size={20} className="text-brand opacity-90" strokeWidth={2.5} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-fg mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed font-medium">
                  {step.desc}
                </p>
                
                {/* Connecting lines for desktop */}
                <div className="hidden lg:block absolute top-6 right-0 w-full h-px bg-gradient-to-r from-border/50 to-transparent -z-10 last:hidden translate-x-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
