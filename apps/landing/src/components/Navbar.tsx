'use client';

import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Para quem é?', href: '#paraquem' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    transition: 'all 0.3s ease',
    background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
  };

  return (
    <header style={navStyle}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <a href="/" id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6C47FF, #00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>K</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F4F4FF' }}>
            KDL <span className="text-gradient">Store</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav id="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(244,244,255,0.55)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F4F4FF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,255,0.55)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div id="nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="nav-desktop">
          <a
            href={`${storeUrl}/login`}
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(244,244,255,0.55)', textDecoration: 'none', transition: 'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F4F4FF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,244,255,0.55)')}
          >
            Entrar
          </a>
          <a
            href="#planos"
            className="btn-primary"
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}
          >
            Começar agora
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4 }}
          className="nav-mobile-btn"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="nav-mobile-menu" style={{ background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(244,244,255,0.65)', textDecoration: 'none' }}>{link.label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href={`${storeUrl}/login`} style={{ textAlign: 'center', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F4F4FF', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Entrar</a>
            <a href="#planos" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>Começar agora</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
