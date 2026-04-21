'use client';

import * as React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LogoTicker } from '@/components/landing/LogoTicker';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg font-sans selection:bg-brand/10 selection:text-brand antialiased">
      <Navbar />
      
      <main id="main-content">
        <Hero />
        
        <div className="relative">
          {/* LogoTicker acts as social proof divider */}
          <LogoTicker />
        </div>

        <article className="relative z-10">
          <Features />
          <HowItWorks />
          <Pricing />
          <CTA />
        </article>
      </main>

      <Footer />
    </div>
  );
}
