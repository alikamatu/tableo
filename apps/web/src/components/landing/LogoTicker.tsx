'use client';

import { RESTAURANTS } from '@/constants/landing-data';

export function LogoTicker() {
  return (
    <section className="py-20 border-y border-border/50 overflow-hidden bg-bg/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12 text-center">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] opacity-80">
          Powering Accra's Premier Dining Destinations
        </p>
      </div>
      
      <div className="relative group">
        <div className="flex gap-20 animate-ticker whitespace-nowrap w-max px-4">
          {[...RESTAURANTS, ...RESTAURANTS, ...RESTAURANTS].map((name, i) => (
            <span 
              key={i} 
              className="text-2xl sm:text-4xl font-black text-fg tracking-tighter opacity-[0.4] group-hover:opacity-10 transition-opacity duration-1000 select-none grayscale"
            >
              {name}
            </span>
          ))}
        </div>
        
        {/* Apple-style smooth fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-bg to-transparent z-10" />
      </div>

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-33.33% - 5rem)); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
