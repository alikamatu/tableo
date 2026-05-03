'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { PLANS } from '@/constants/landing-data';

export function Pricing() {
  return (
    <section id="pricing" className="overflow-hidden bg-bg py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-fg-muted mb-4 text-[10px] font-bold uppercase tracking-[0.3em]">
            Investment
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
            Simple pricing. Built for growth.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Choose a plan that fits your current needs and scale seamlessly as you expand your
            restaurant empire. No hidden fees. No surprises.
          </p>
        </div>

        <div className="p-grid mx-auto grid max-w-6xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className={`p-card relative flex flex-col rounded-[40px] p-10 transition-all duration-500 hover:translate-y-[-8px] ${
                plan.highlight
                  ? 'bg-fg text-bg shadow-2xl shadow-black/20'
                  : 'border border-border/50 bg-surface/50 hover:border-border'
              }`}
            >
              {plan.highlight && (
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
              )}

              <div className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${plan.highlight ? 'text-bg-muted' : 'text-muted'}`}
                  >
                    {plan.name}
                  </p>
                  {plan.highlight && (
                    <span className="rounded-full bg-brand px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-6xl font-black tracking-tighter ${plan.highlight ? 'text-bg' : 'text-fg'}`}
                  >
                    GHS {plan.price}
                  </span>
                  <span
                    className={`text-sm font-bold ${plan.highlight ? 'text-bg/60' : 'text-muted'}`}
                  >
                    /mo
                  </span>
                </div>
                <p
                  className={`mt-6 text-sm font-medium leading-relaxed ${plan.highlight ? 'text-bg/80' : 'text-fg-muted'}`}
                >
                  {plan.desc}
                </p>
              </div>

              <div
                className={`mb-10 h-px w-full ${plan.highlight ? 'bg-bg/10' : 'bg-border/50'}`}
              />

              <ul className="mb-10 flex-1 space-y-4">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-4 text-sm font-semibold tracking-tight"
                  >
                    <div
                      className={`mt-0.5 shrink-0 rounded-full p-0.5 ${plan.highlight ? 'text-brand' : 'text-brand'}`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className={plan.highlight ? 'text-bg/90' : 'text-fg'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`group flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  plan.highlight
                    ? 'bg-brand text-white hover:opacity-90'
                    : 'bg-fg text-bg hover:opacity-90'
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
