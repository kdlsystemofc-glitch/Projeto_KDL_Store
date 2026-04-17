'use client';

import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Para quem é?', href: '#paraquem' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group" id="nav-logo">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #6C47FF, #00D4AA)' }}
          >
            K
          </div>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            KDL <span className="text-gradient">Store</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" id="nav-desktop">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'rgba(244,244,255,0.55)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F4F4FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(244,244,255,0.55)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3" id="nav-cta">
          <a
            href={`${process.env.NEXT_PUBLIC_STORE_URL || ''}/login`}
            className="text-sm font-medium text-white/55 hover:text-white transition-colors"
          >
            Entrar
          </a>
          <a href="#planos" className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
            Começar agora
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          id="nav-mobile-toggle"
          className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="nav-mobile-menu"
          className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: 'rgba(10,10,15,0.95)' }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/55 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <a href={`${process.env.NEXT_PUBLIC_STORE_URL || ''}/login`} className="btn-secondary text-center">
              Entrar
            </a>
            <a href="#planos" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>
              Começar agora
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
