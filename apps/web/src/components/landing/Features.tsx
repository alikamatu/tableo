'use client';

import { motion } from 'framer-motion';
import { FEATURES } from '@/constants/landing-data';

export function Features() {
  return (
    <section id="features" className="bg-bg py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-20 text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-brand">
            The Platform
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
            Everything restaurants need to serve customers faster.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Built for scale. Designed for precision. Tableo replaces clunky systems with a unified
            experience that delights your guests and your staff.
          </p>
        </div>

        <div className="f-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45 }}
                className="f-card group relative overflow-hidden rounded-[32px] border border-border/50 bg-surface/50 p-8 transition-all duration-500 hover:border-brand/30"
              >
                {/* Linear-style gradient glow on hover */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-bg shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-brand/20">
                    <Icon
                      size={20}
                      className="text-brand opacity-80 transition-opacity group-hover:opacity-100"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <h3 className="mb-3 text-lg font-bold tracking-tight text-fg">{feature.title}</h3>
                <p className="text-fg-muted text-sm font-medium leading-relaxed">{feature.desc}</p>

                {/* Sub-visual placeholder - clean & minimal */}
                <div className="mt-8 border-t border-border/30 pt-8">
                  <div className="h-1 w-24 overflow-hidden rounded-full bg-subtle">
                    <div className="h-full w-0 bg-brand/20 transition-all delay-300 duration-1000 group-hover:w-full" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
