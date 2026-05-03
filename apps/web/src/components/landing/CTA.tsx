'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-bg px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ scale: 0.98, y: 20, opacity: 0 }}
          whileInView={{ scale: 1, y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="cta-box relative overflow-hidden rounded-[48px] bg-fg px-8 py-20 text-center sm:p-20"
        >
          {/* Subtle noise/texture or just clean color */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-bg sm:text-6xl">
              Stop sending PDFs. <br /> Start taking orders.
            </h2>
            <p className="mt-8 text-lg font-medium leading-relaxed text-bg/70 sm:text-xl">
              Join the future of dining. Thousands of orders are processed monthly through Tableo
              across Accra's finest restaurants.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand px-10 text-base font-bold text-white shadow-xl shadow-brand/10 transition-all hover:opacity-90 active:scale-95"
              >
                Create your account
                <CheckCircle2 size={18} className="transition-transform group-hover:scale-110" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-8 text-base font-bold text-bg/60 transition-colors hover:text-bg"
              >
                Sign in
                <ArrowLeftRight size={16} />
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 border-t border-bg/[0.05] pt-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bg/40">
                Free setup
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bg/40">
                Cancel anytime
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bg/40">
                No CC required
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
