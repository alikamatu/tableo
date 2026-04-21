'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FEATURES } from '@/constants/landing-data';

gsap.registerPlugin(ScrollTrigger);

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Linear-style staggered reveal
      gsap.fromTo('.f-card', 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.f-grid',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-20 text-center">
          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.3em] mb-4">The Platform</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-fg tracking-tight leading-tight max-w-3xl mx-auto">
            Everything restaurants need to serve customers faster.
          </h2>
          <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Built for scale. Designed for precision. Tableo replaces clunky systems 
            with a unified experience that delights your guests and your staff.
          </p>
        </div>

        <div className="f-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id} 
                className="f-card group relative bg-surface/50 border border-border/50 p-8 rounded-[32px] overflow-hidden hover:border-brand/30 transition-all duration-500"
              >
                {/* Linear-style gradient glow on hover */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="mb-8">
                  <div className="h-10 w-10 rounded-xl bg-bg border border-border/50 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-brand/20 transition-all duration-500">
                    <Icon size={20} className="text-brand opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-fg mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-fg-muted leading-relaxed font-medium">
                  {feature.desc}
                </p>

                {/* Sub-visual placeholder - clean & minimal */}
                <div className="mt-8 pt-8 border-t border-border/30">
                   <div className="h-1 w-24 bg-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-brand/20 w-0 group-hover:w-full transition-all duration-1000 delay-300" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
