'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-box', {
        scale: 0.98,
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-bg px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="cta-box relative rounded-[48px] bg-fg overflow-hidden px-8 py-20 sm:p-20 text-center">
          {/* Subtle noise/texture or just clean color */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-bold text-bg tracking-tight leading-[1.1]">
              Stop sending PDFs. <br /> Start taking orders.
            </h2>
            <p className="mt-8 text-bg/70 text-lg sm:text-xl font-medium leading-relaxed">
              Join the future of dining. Thousands of orders are processed monthly 
              through Tableo across Accra's finest restaurants.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="group inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl bg-brand text-white text-base font-bold hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-brand/10"
              >
                Create your account
                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl text-bg/60 text-base font-bold hover:text-bg transition-colors"
              >
                Sign in 
                <ArrowLeftRight size={16} />
              </Link>
            </div>
            
            <div className="mt-12 pt-12 border-t border-bg/[0.05] flex items-center justify-center gap-8">
               <span className="text-[10px] font-bold text-bg/40 uppercase tracking-[0.2em]">Free setup</span>
               <span className="text-[10px] font-bold text-bg/40 uppercase tracking-[0.2em]">Cancel anytime</span>
               <span className="text-[10px] font-bold text-bg/40 uppercase tracking-[0.2em]">No CC required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
