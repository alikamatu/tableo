'use client';

import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden pb-20 pt-20 lg:pb-28 lg:pt-32"
    >
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(ellipse, #dc2626 0%, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="bg-brand/8 mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 px-3 py-1"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          <span className="text-xs font-medium text-brand">Built for restaurants in Ghana</span>
        </motion.div>

        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-[64px]"
        >
          Your menu. <span className="text-brand">Scanned.</span> Ordered.{' '}
          <span className="relative inline-block">
            Done.
            <svg
              viewBox="0 0 120 10"
              className="absolute -bottom-1 left-0 w-full"
              fill="none"
              aria-hidden
            >
              <path
                d="M2 7 Q30 2 60 6 Q90 10 118 4"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-draw"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
              />
            </svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted"
        >
          Replace that 104&thinsp;MB Google Drive PDF with a lightning-fast digital menu. QR
          ordering, live order management, multi-branch analytics — all in one platform.
        </motion.p>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand/90 active:scale-[0.98]"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-subtle px-6 text-sm font-semibold text-fg transition-colors duration-150 hover:bg-subtle/60"
          >
            See how it works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-1.5"
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-brand text-brand" />
          ))}
          <span className="ml-2 text-sm text-muted">
            Trusted by <strong className="font-semibold text-fg">200+</strong> restaurants across
            Accra
          </span>
        </motion.div>
      </div>

      {/* Dashboard mockup */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.22 }}
        className="mx-auto mt-16 max-w-5xl px-6 lg:px-8"
      >
        <div className="relative animate-float overflow-hidden rounded-2xl ring-1 ring-border">
          <DashboardMockup />
        </div>
      </motion.div>
    </motion.section>
  );
}

function DashboardMockup() {
  return (
    <svg
      viewBox="0 0 1000 560"
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tableo dashboard preview"
    >
      <rect width="1000" height="560" fill="hsl(0 0% 97%)" className="dark:fill-[hsl(0_0%_6%)]" />
      <rect width="1000" height="40" fill="hsl(0 0% 100%)" className="dark:fill-[hsl(0_0%_0%)]" />
      <circle cx="18" cy="20" r="5" fill="#ef4444" />
      <circle cx="34" cy="20" r="5" fill="#f59e0b" />
      <circle cx="50" cy="20" r="5" fill="#22c55e" />
      <rect x="200" y="12" width="600" height="16" rx="4" fill="hsl(0 0% 93%)" />
      <rect
        x="0"
        y="40"
        width="200"
        height="520"
        fill="hsl(0 0% 100%)"
        className="dark:fill-[hsl(0_0%_0%)]"
      />
      <rect x="16" y="60" width="22" height="22" rx="6" fill="#dc2626" />
      <text
        x="27"
        y="75"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="700"
        fontFamily="Inter,sans-serif"
      >
        T
      </text>
      <rect x="46" y="65" width="60" height="10" rx="3" fill="hsl(0 0% 93%)" />
      {[
        { y: 110, active: false },
        { y: 134, active: true },
        { y: 158, active: false },
        { y: 182, active: false },
        { y: 206, active: false },
        { y: 230, active: false },
        { y: 254, active: false },
      ].map(({ y, active }, i) => (
        <g key={i}>
          <rect
            x="12"
            y={y - 10}
            width="176"
            height="26"
            rx="6"
            fill={active ? '#dc2626' : 'transparent'}
          />
          <rect
            x="16"
            y={y - 4}
            width="14"
            height="14"
            rx="3"
            fill={active ? 'rgba(255,255,255,0.25)' : 'hsl(0 0% 90%)'}
          />
          <rect
            x="36"
            y={y}
            width={[80, 70, 55, 75, 65, 60, 72][i]}
            height="8"
            rx="3"
            fill={active ? 'rgba(255,255,255,0.75)' : 'hsl(0 0% 88%)'}
          />
        </g>
      ))}
      <rect
        x="200"
        y="40"
        width="800"
        height="520"
        fill="hsl(0 0% 98%)"
        className="dark:fill-[hsl(0_0%_4%)]"
      />
      <rect
        x="200"
        y="40"
        width="800"
        height="44"
        fill="hsl(0 0% 100%)"
        className="dark:fill-[hsl(0_0%_0%)]"
      />
      <rect x="680" y="52" width="70" height="18" rx="4" fill="hsl(0 0% 93%)" />
      <circle cx="810" cy="62" r="13" fill="#dc2626" opacity="0.12" />
      <circle cx="810" cy="62" r="9" fill="#dc2626" opacity="0.25" />
      <text
        x="810"
        y="66"
        textAnchor="middle"
        fill="#dc2626"
        fontSize="9"
        fontWeight="700"
        fontFamily="Inter,sans-serif"
      >
        K
      </text>
      <text
        x="224"
        y="108"
        fill="hsl(0 0% 8%)"
        fontSize="16"
        fontWeight="600"
        fontFamily="Inter,sans-serif"
      >
        Analytics
      </text>
      <text x="224" y="124" fill="hsl(0 0% 50%)" fontSize="11" fontFamily="Inter,sans-serif">
        Revenue and order trends across all branches.
      </text>
      {[
        { x: 224, label: 'Revenue', value: 'GHS 12,480', change: '+18%', pos: true },
        { x: 424, label: 'Orders', value: '284', change: '+9%', pos: true },
        { x: 624, label: 'Avg. order', value: 'GHS 43.90', change: '-3%', pos: false },
        { x: 824, label: 'Staff', value: '7', change: '', pos: true },
      ].map(({ x, label, value, change, pos }) => (
        <g key={x}>
          <rect x={x} y="140" width="176" height="84" rx="10" fill="hsl(0 0% 100%)" />
          <text x={x + 14} y="162" fill="hsl(0 0% 50%)" fontSize="10" fontFamily="Inter,sans-serif">
            {label}
          </text>
          <text
            x={x + 14}
            y="194"
            fill="hsl(0 0% 7%)"
            fontSize="19"
            fontWeight="600"
            fontFamily="Inter,sans-serif"
          >
            {value}
          </text>
          {change && (
            <text
              x={x + 14}
              y="212"
              fill={pos ? '#16a34a' : '#dc2626'}
              fontSize="9"
              fontFamily="Inter,sans-serif"
            >
              {change}
            </text>
          )}
        </g>
      ))}
      <rect x="224" y="244" width="576" height="278" rx="10" fill="hsl(0 0% 100%)" />
      <text
        x="240"
        y="268"
        fill="hsl(0 0% 8%)"
        fontSize="12"
        fontWeight="600"
        fontFamily="Inter,sans-serif"
      >
        Revenue — last 30 days
      </text>
      {[40, 65, 45, 80, 55, 90, 70, 100, 75, 85, 60, 95, 50, 100, 72].map((h, i) => (
        <rect
          key={i}
          x={244 + i * 36}
          y={482 - h * 1.55}
          width="22"
          height={h * 1.55}
          rx="4"
          fill="#dc2626"
          opacity={0.1 + (i / 14) * 0.8}
        />
      ))}
      <rect x="820" y="244" width="160" height="278" rx="10" fill="hsl(0 0% 100%)" />
      <text
        x="836"
        y="268"
        fill="hsl(0 0% 8%)"
        fontSize="12"
        fontWeight="600"
        fontFamily="Inter,sans-serif"
      >
        Orders
      </text>
      {[
        { status: 'pending', color: '#f59e0b', table: 'T4' },
        { status: 'confirmed', color: '#dc2626', table: 'T1' },
        { status: 'ready', color: '#16a34a', table: 'T7' },
        { status: 'done', color: '#9ca3af', table: 'T2' },
        { status: 'pending', color: '#f59e0b', table: 'T9' },
      ].map(({ color, table }, i) => (
        <g key={i}>
          <rect x="836" y={284 + i * 46} width="128" height="38" rx="6" fill="hsl(0 0% 95%)" />
          <text
            x="850"
            y={302 + i * 46}
            fill="hsl(0 0% 8%)"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter,sans-serif"
          >
            ORD-00{i + 1}
          </text>
          <text
            x="850"
            y={315 + i * 46}
            fill="hsl(0 0% 55%)"
            fontSize="9"
            fontFamily="Inter,sans-serif"
          >
            Table {table}
          </text>
          <circle cx="948" cy={298 + i * 46} r="5" fill={color} />
        </g>
      ))}
    </svg>
  );
}

export default Hero;
