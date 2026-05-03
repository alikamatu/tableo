'use client';

import { motion } from 'framer-motion';
import { STEPS } from '@/constants/landing-data';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/50 bg-bg py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20">
          <p className="text-fg-muted mb-4 text-[10px] font-bold uppercase tracking-[0.3em]">
            Process
          </p>
          <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
            Up and running in under 10 minutes.
          </h2>
        </div>

        <div className="how-grid grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ y: 28, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                className="how-step group"
              >
                <div className="relative mb-8">
                  <div className="absolute -left-4 -top-12 select-none text-[100px] font-black text-fg/[0.03] transition-colors duration-700 group-hover:text-brand/[0.05]">
                    {step.n}
                  </div>
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-surface shadow-lg shadow-black/[0.02] transition-all duration-500 group-hover:scale-110 group-hover:border-brand/20">
                    <Icon size={20} className="text-brand opacity-90" strokeWidth={2.5} />
                  </div>
                </div>

                <h3 className="mb-3 text-lg font-bold tracking-tight text-fg">{step.title}</h3>
                <p className="text-fg-muted text-sm font-medium leading-relaxed">{step.desc}</p>

                {/* Connecting lines for desktop */}
                <div className="absolute right-0 top-6 -z-10 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-border/50 to-transparent last:hidden lg:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
