'use client';

import * as React from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div
      ref={containerRef}
      className="relative hidden h-full w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-fg p-12 text-bg lg:flex"
    >
      {/* Abstract Background */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="200" fill="white" />
          <circle cx="400" cy="600" r="150" fill="white" />
          <path d="M0 300 Q100 200 200 300 T400 300" stroke="white" fill="none" strokeWidth="1" />
          <path d="M0 400 Q100 300 200 400 T400 400" stroke="white" fill="none" strokeWidth="1" />
        </svg>
      </div>

      <motion.div
        key={content.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="relative z-10"
      >
        <div className="mb-16 flex items-center gap-3">
          <Logo
            variant="icon"
            size={32}
            className="invert transition-transform duration-500 group-hover:scale-110"
          />
          <span className="text-lg font-bold tracking-tight">Tableo</span>
        </div>

        <h2
          ref={(el) => {
            if (el) elementsRef.current.title = el;
          }}
          className="mb-6 text-4xl font-black leading-[1.1] tracking-tighter"
        >
          {content.title}
        </h2>
        <p
          ref={(el) => {
            if (el) elementsRef.current.subtitle = el;
          }}
          className="max-w-[300px] text-base font-medium leading-relaxed text-bg/60"
        >
          {content.subtitle}
        </p>
      </motion.div>

      <motion.div
        ref={(el) => {
          if (el) elementsRef.current.bullets = el;
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.04 }}
        className="relative z-10 space-y-5"
      >
        {content.bullets.map((text) => (
          <div key={text} className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20">
              <Check size={14} className="text-brand" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-bg/90">{text}</span>
          </div>
        ))}
      </motion.div>

      <div className="relative z-10 border-t border-bg/10 pt-12">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 w-9 rounded-full border-2 border-fg bg-bg/20 backdrop-blur-sm"
              />
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase leading-normal tracking-[0.2em] text-bg/40">
            The Standard for <br /> modern restaurants
          </p>
        </div>
      </div>
    </div>
  );
}
