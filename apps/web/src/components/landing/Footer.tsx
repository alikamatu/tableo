'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { FOOTER_LINKS } from '@/constants/landing-data';

export function Footer() {
  return (
    <footer className="bg-bg border-t border-border/50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
              <Logo variant="icon" size={32} />
              <span className="text-lg font-bold tracking-tight text-fg">Tableo</span>
            </Link>
            <p className="text-sm text-fg-muted font-medium leading-relaxed max-w-xs">
              Empowering restaurants in Ghana with precision digital tools for the modern dining era.
            </p>
          </div>
          
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="flex flex-col gap-6">
              <h4 className="text-[10px] font-bold text-fg uppercase tracking-[0.3em]">{group.title}</h4>
              <nav className="flex flex-col gap-4">
                {group.links.map((link) => (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    className="text-sm font-semibold text-fg-muted hover:text-fg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        
        <div className="pt-12 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
            <span>© {new Date().getFullYear()} Tableo</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Built in Accra</span>
          </div>
          
          <div className="flex items-center gap-6">
            {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[10px] font-bold text-muted hover:text-fg uppercase tracking-[0.2em] transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
