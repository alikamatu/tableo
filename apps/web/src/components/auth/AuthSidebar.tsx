'use client';

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Logo } from '@/components/shared/Logo';
import { Check } from 'lucide-react';

export interface SidebarContent {
  title: string;
  subtitle: string;
  bullets: string[];
}

interface AuthSidebarProps {
  content: SidebarContent;
}

export function AuthSidebar({ content }: AuthSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<{
    title: HTMLHeadingElement | null;
    subtitle: HTMLParagraphElement | null;
    bullets: HTMLDivElement | null;
  }>({ title: null, subtitle: null, bullets: null });

  useEffect(() => {
    // Elegant Apple-style transition when content changes
    const tl = gsap.timeline();
    
    tl.to([elementsRef.current.title, elementsRef.current.subtitle, elementsRef.current.bullets], {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in',
    })
    .set([elementsRef.current.title, elementsRef.current.subtitle, elementsRef.current.bullets], {
      y: 10,
    })
    .to([elementsRef.current.title, elementsRef.current.subtitle, elementsRef.current.bullets], {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power4.out',
    });

  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="hidden lg:flex w-[420px] bg-fg p-12 text-bg flex-col justify-between relative overflow-hidden shrink-0 h-full"
    >
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <svg width="100%" height="100%" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="0" r="200" fill="white" />
            <circle cx="400" cy="600" r="150" fill="white" />
            <path d="M0 300 Q100 200 200 300 T400 300" stroke="white" fill="none" strokeWidth="1" />
            <path d="M0 400 Q100 300 200 400 T400 400" stroke="white" fill="none" strokeWidth="1" />
         </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-16">
          <Logo variant="icon" size={32} className="invert group-hover:scale-110 transition-transform duration-500" />
          <span className="text-lg font-bold tracking-tight">Tableo</span>
        </div>

        <h2 
          ref={(el) => { if (el) elementsRef.current.title = el }}
          className="text-4xl font-black leading-[1.1] mb-6 tracking-tighter"
        >
          {content.title}
        </h2>
        <p 
          ref={(el) => { if (el) elementsRef.current.subtitle = el }}
          className="text-bg/60 text-base font-medium leading-relaxed max-w-[300px]"
        >
          {content.subtitle}
        </p>
      </div>

      <div 
        ref={(el) => { if (el) elementsRef.current.bullets = el }}
        className="relative z-10 space-y-5"
      >
         {content.bullets.map((text) => (
            <div key={text} className="flex items-center gap-3">
               <div className="h-6 w-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-brand" strokeWidth={3} />
               </div>
               <span className="text-xs font-bold text-bg/90 uppercase tracking-[0.15em]">{text}</span>
            </div>
         ))}
      </div>

      <div className="relative z-10 pt-12 border-t border-bg/10">
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="h-9 w-9 rounded-full border-2 border-fg bg-bg/20 backdrop-blur-sm" />
               ))}
            </div>
            <p className="text-[10px] font-bold text-bg/40 uppercase tracking-[0.2em] leading-normal">
               The Standard for <br /> modern restaurants
            </p>
         </div>
      </div>
    </div>
  );
}
